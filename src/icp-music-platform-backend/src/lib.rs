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

thread_local! {
    static ARTISTS: RefCell<Vec<Artist>> = RefCell::new(Vec::new());
    static TRACKS: RefCell<Vec<Track>> = RefCell::new(Vec::new());
    static ARTIST_ID: RefCell<u64> = RefCell::new(1);
    static TRACK_ID: RefCell<u64> = RefCell::new(1);
    static TRACK_VERSIONS: RefCell<Vec<(u64, Vec<TrackVersion>)>> = RefCell::new(Vec::new()); // track_id -> versions
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
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            track.comments.push(Comment { commenter, text });
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
