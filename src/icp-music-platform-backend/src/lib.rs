use ic_cdk::storage;
use candid::{CandidType, Deserialize};
use std::cell::RefCell;

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Artist {
    pub id: u64,
    pub name: String,
    pub bio: String,
    pub social: Option<String>,
    pub royalty_balance: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Comment {
    pub commenter: u64, // artist id
    pub text: String,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Split {
    pub id: u64, // artist id
    pub pct: u8, // percentage
}

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub enum TrackVisibility {
    Public,
    Private,
    InviteOnly,
}

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub enum TrackRole {
    Owner,
    Collaborator,
    Viewer,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Track {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub contributors: Vec<u64>, // artist ids
    pub version: u32,
    pub splits: Option<Vec<Split>>,
    pub comments: Vec<Comment>,
    pub payments: Vec<Payment>,
    pub visibility: TrackVisibility,
    pub invited: Vec<u64>, // user ids invited to collaborate
    pub roles: Vec<(u64, TrackRole)>, // user id, role
    pub ratings: Vec<(u64, u8)>, // user_id, rating (1-5)
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct TrackVersion {
    pub version: u32,
    pub title: String,
    pub description: String,
    pub contributors: Vec<u64>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Payment {
    pub payer: u64, // artist id or user id
    pub amount: u64, // in smallest unit (e.g., tokens)
    pub timestamp: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Activity {
    pub user_id: u64,
    pub action: String,
    pub timestamp: u64,
    pub details: String,
}

thread_local! {
    static ARTISTS: RefCell<Vec<Artist>> = RefCell::new(Vec::new());
    static TRACKS: RefCell<Vec<Track>> = RefCell::new(Vec::new());
    static ARTIST_ID: RefCell<u64> = RefCell::new(1);
    static TRACK_ID: RefCell<u64> = RefCell::new(1);
    static TRACK_VERSIONS: RefCell<Vec<(u64, Vec<TrackVersion>)>> = RefCell::new(Vec::new()); // track_id -> versions
    static ACTIVITY_LOG: RefCell<Vec<Activity>> = RefCell::new(Vec::new());
}

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

// Artist CRUD
#[ic_cdk::update]
fn register_artist(name: String, bio: String, social: Option<String>) -> Artist {
    ARTISTS.with(|artists| {
        ARTIST_ID.with(|id| {
            let mut id_mut = id.borrow_mut();
            let artist = Artist {
                id: *id_mut,
                name,
                bio,
                social,
                royalty_balance: 0,
            };
            artists.borrow_mut().push(artist.clone());
            *id_mut += 1;
            artist
        })
    })
}

#[ic_cdk::query]
fn get_artist(id: u64) -> Option<Artist> {
    ARTISTS.with(|artists| artists.borrow().iter().find(|a| a.id == id).cloned())
}

#[ic_cdk::update]
fn update_artist(id: u64, name: String, bio: String, social: Option<String>) -> Option<Artist> {
    ARTISTS.with(|artists| {
        let mut artists = artists.borrow_mut();
        if let Some(artist) = artists.iter_mut().find(|a| a.id == id) {
            artist.name = name;
            artist.bio = bio;
            artist.social = social;
            return Some(artist.clone());
        }
        None
    })
}

#[ic_cdk::query]
fn list_artists() -> Vec<Artist> {
    ARTISTS.with(|artists| artists.borrow().clone())
}

// Track CRUD
#[ic_cdk::update]
fn create_track(title: String, description: String, contributors: Vec<u64>) -> Track {
    let now = ic_cdk::api::time() / 1_000_000;
    let contributors_for_log = contributors.clone();
    TRACKS.with(|tracks| {
        TRACK_ID.with(|id| {
            let mut id_mut = id.borrow_mut();
            let mut roles = vec![];
            for &cid in &contributors {
                roles.push((cid, TrackRole::Owner));
            }
            let track = Track {
                id: *id_mut,
                title: title.clone(),
                description: description.clone(),
                contributors: contributors.clone(),
                version: 1,
                splits: None,
                comments: vec![],
                payments: vec![],
                visibility: TrackVisibility::Public,
                invited: vec![],
                roles,
                ratings: vec![],
            };
            tracks.borrow_mut().push(track.clone());
            // Store initial version
            TRACK_VERSIONS.with(|tv| {
                let mut tv = tv.borrow_mut();
                let version = TrackVersion {
                    version: 1,
                    title,
                    description,
                    contributors,
                };
                tv.push((track.id, vec![version]));
            });
            // Log activity for each contributor
            for &cid in &contributors_for_log {
                log_activity(cid, "create_track", now, &format!("Track {} created", track.id));
            }
            *id_mut += 1;
            track
        })
    })
}

#[ic_cdk::query]
fn get_track(id: u64) -> Option<Track> {
    TRACKS.with(|tracks| tracks.borrow().iter().find(|t| t.id == id).cloned())
}

#[ic_cdk::update]
fn update_track(id: u64, title: String, description: String, contributors: Vec<u64>, version: u32) -> Option<Track> {
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == id) {
            track.title = title;
            track.description = description;
            track.contributors = contributors;
            track.version = version;
            return Some(track.clone());
        }
        None
    })
}

#[ic_cdk::query]
fn list_tracks() -> Vec<Track> {
    TRACKS.with(|tracks| tracks.borrow().clone())
}

// Add/Update splits for a track
#[ic_cdk::update]
fn set_track_splits(track_id: u64, splits: Vec<Split>) -> Option<Track> {
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            track.splits = Some(splits);
            return Some(track.clone());
        }
        None
    })
}

#[ic_cdk::query]
fn get_track_splits(track_id: u64) -> Option<Vec<Split>> {
    TRACKS.with(|tracks| {
        tracks.borrow().iter().find(|t| t.id == track_id).and_then(|t| t.splits.clone())
    })
}

// Add a comment to a track
#[ic_cdk::update]
fn add_comment(track_id: u64, commenter: u64, text: String) -> Option<Track> {
    let now = ic_cdk::api::time() / 1_000_000;
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            track.comments.push(Comment { commenter, text: text.clone() });
            log_activity(commenter, "add_comment", now, &format!("Commented on track {}: {}", track_id, text));
            return Some(track.clone());
        }
        None
    })
}

#[ic_cdk::query]
fn list_comments(track_id: u64) -> Vec<Comment> {
    TRACKS.with(|tracks| {
        tracks.borrow().iter().find(|t| t.id == track_id).map(|t| t.comments.clone()).unwrap_or_default()
    })
}

// Add a new version to a track
#[ic_cdk::update]
fn add_track_version(track_id: u64, title: String, description: String, contributors: Vec<u64>) -> Option<TrackVersion> {
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            let new_version = track.version + 1;
            track.version = new_version;
            track.title = title.clone();
            track.description = description.clone();
            track.contributors = contributors.clone();
            let version = TrackVersion {
                version: new_version,
                title,
                description,
                contributors,
            };
            TRACK_VERSIONS.with(|tv| {
                let mut tv = tv.borrow_mut();
                if let Some((_, versions)) = tv.iter_mut().find(|(id, _)| *id == track_id) {
                    versions.push(version.clone());
                } else {
                    tv.push((track_id, vec![version.clone()]));
                }
            });
            return Some(version);
        }
        None
    })
}

#[ic_cdk::query]
fn get_track_versions(track_id: u64) -> Vec<TrackVersion> {
    TRACK_VERSIONS.with(|tv| {
        tv.borrow().iter().find(|(id, _)| *id == track_id).map(|(_, v)| v.clone()).unwrap_or_default()
    })
}

// Search tracks by title (case-insensitive substring)
#[ic_cdk::query]
fn search_tracks_by_title(query: String) -> Vec<Track> {
    let q = query.to_lowercase();
    TRACKS.with(|tracks| {
        tracks.borrow().iter().filter(|t| t.title.to_lowercase().contains(&q)).cloned().collect()
    })
}

// Search tracks by contributor (artist id)
#[ic_cdk::query]
fn search_tracks_by_contributor(artist_id: u64) -> Vec<Track> {
    TRACKS.with(|tracks| {
        tracks.borrow().iter().filter(|t| t.contributors.contains(&artist_id)).cloned().collect()
    })
}

// Delete a track by id
#[ic_cdk::update]
fn delete_track(track_id: u64) -> bool {
    let mut deleted = false;
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        let len_before = tracks.len();
        tracks.retain(|t| t.id != track_id);
        deleted = tracks.len() < len_before;
    });
    TRACK_VERSIONS.with(|tv| {
        let mut tv = tv.borrow_mut();
        tv.retain(|(id, _)| *id != track_id);
    });
    deleted
}

// Distribute payment for a track
#[ic_cdk::update]
fn distribute_payment(track_id: u64, payer: u64, amount: u64, timestamp: u64) -> bool {
    let mut distributed = false;
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            if let Some(splits) = &track.splits {
                for split in splits {
                    let share = amount * (split.pct as u64) / 100;
                    ARTISTS.with(|artists| {
                        if let Some(artist) = artists.borrow_mut().iter_mut().find(|a| a.id == split.id) {
                            artist.royalty_balance += share;
                        }
                    });
                }
                track.payments.push(Payment { payer, amount, timestamp });
                distributed = true;
                log_activity(payer, "distribute_payment", timestamp, &format!("Paid {} for track {}", amount, track_id));
            }
        }
    });
    distributed
}

// View artist royalty balance
#[ic_cdk::query]
fn get_royalty_balance(artist_id: u64) -> u64 {
    ARTISTS.with(|artists| {
        artists.borrow().iter().find(|a| a.id == artist_id).map(|a| a.royalty_balance).unwrap_or(0)
    })
}

// View payment history for a track
#[ic_cdk::query]
fn get_payment_history(track_id: u64) -> Vec<Payment> {
    TRACKS.with(|tracks| {
        tracks.borrow().iter().find(|t| t.id == track_id).map(|t| t.payments.clone()).unwrap_or_default()
    })
}

// Set track visibility
#[ic_cdk::update]
fn set_track_visibility(track_id: u64, visibility: TrackVisibility) -> bool {
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            track.visibility = visibility;
            return true;
        }
        false
    })
}

// Get track visibility
#[ic_cdk::query]
fn get_track_visibility(track_id: u64) -> Option<TrackVisibility> {
    TRACKS.with(|tracks| {
        tracks.borrow().iter().find(|t| t.id == track_id).map(|t| t.visibility.clone())
    })
}

// Invite user to track
#[ic_cdk::update]
fn invite_user(track_id: u64, user_id: u64) -> bool {
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            if !track.invited.contains(&user_id) {
                track.invited.push(user_id);
            }
            return true;
        }
        false
    })
}

// Assign role to user
#[ic_cdk::update]
fn assign_role(track_id: u64, user_id: u64, role: TrackRole) -> bool {
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            if let Some(r) = track.roles.iter_mut().find(|(id, _)| *id == user_id) {
                r.1 = role;
            } else {
                track.roles.push((user_id, role));
            }
            return true;
        }
        false
    })
}

// Get user role for a track
#[ic_cdk::query]
fn get_user_role(track_id: u64, user_id: u64) -> Option<TrackRole> {
    TRACKS.with(|tracks| {
        tracks.borrow().iter().find(|t| t.id == track_id)
            .and_then(|track| track.roles.iter().find(|(id, _)| *id == user_id).map(|(_, role)| role.clone()))
    })
}

// Helper to log activity
fn log_activity(user_id: u64, action: &str, timestamp: u64, details: &str) {
    ACTIVITY_LOG.with(|log| {
        log.borrow_mut().push(Activity {
            user_id,
            action: action.to_string(),
            timestamp,
            details: details.to_string(),
        });
    });
}

// Fetch user activity
#[ic_cdk::query]
fn get_user_activity(user_id: u64) -> Vec<Activity> {
    ACTIVITY_LOG.with(|log| {
        log.borrow().iter().filter(|a| a.user_id == user_id).cloned().collect()
    })
}

// Fetch recent activity (most recent N)
#[ic_cdk::query]
fn get_recent_activity(count: u32) -> Vec<Activity> {
    ACTIVITY_LOG.with(|log| {
        let log = log.borrow();
        let len = log.len();
        let start = if len > count as usize { len - count as usize } else { 0 };
        log[start..].to_vec()
    })
}

// Rate a track
#[ic_cdk::update]
fn rate_track(track_id: u64, user_id: u64, rating: u8) -> bool {
    if rating < 1 || rating > 5 {
        return false;
    }
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            if let Some(r) = track.ratings.iter_mut().find(|(uid, _)| *uid == user_id) {
                r.1 = rating;
            } else {
                track.ratings.push((user_id, rating));
            }
            return true;
        }
        false
    })
}

// Get average rating and count for a track
#[ic_cdk::query]
fn get_track_rating(track_id: u64) -> (u32, u8) {
    TRACKS.with(|tracks| {
        tracks.borrow().iter().find(|t| t.id == track_id).map(|t| {
            let count = t.ratings.len() as u32;
            let sum: u32 = t.ratings.iter().map(|(_, r)| *r as u32).sum();
            let avg = if count > 0 { (sum / count) as u8 } else { 0 };
            (count, avg)
        }).unwrap_or((0, 0))
    })
}

// Get a user's rating for a track
#[ic_cdk::query]
fn get_user_track_rating(track_id: u64, user_id: u64) -> Option<u8> {
    TRACKS.with(|tracks| {
        tracks.borrow().iter().find(|t| t.id == track_id)
            .and_then(|t| t.ratings.iter().find(|(uid, _)| *uid == user_id).map(|(_, r)| *r))
    })
}
