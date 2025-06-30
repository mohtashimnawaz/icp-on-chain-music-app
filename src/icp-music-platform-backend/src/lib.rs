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
    pub profile_image_url: Option<String>,
    pub links: Option<Vec<String>>,
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
    pub tags: Vec<String>,
    pub genre: Option<String>,
    pub play_count: u64, // new field for analytics
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

// Collaboration Request and Task Management
#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub enum CollabRequestStatus {
    Pending,
    Accepted,
    Declined,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct CollabRequest {
    pub id: u64,
    pub from: u64, // artist id
    pub to: u64,   // artist id
    pub track_id: u64,
    pub message: Option<String>,
    pub status: CollabRequestStatus,
    pub timestamp: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub enum TaskStatus {
    Open,
    InProgress,
    Completed,
    Cancelled,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Task {
    pub id: u64,
    pub track_id: u64,
    pub assigned_to: u64, // artist id
    pub description: String,
    pub status: TaskStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

thread_local! {
    static ARTISTS: RefCell<Vec<Artist>> = RefCell::new(Vec::new());
    static TRACKS: RefCell<Vec<Track>> = RefCell::new(Vec::new());
    static ARTIST_ID: RefCell<u64> = RefCell::new(1);
    static TRACK_ID: RefCell<u64> = RefCell::new(1);
    static TRACK_VERSIONS: RefCell<Vec<(u64, Vec<TrackVersion>)>> = RefCell::new(Vec::new()); // track_id -> versions
    static ACTIVITY_LOG: RefCell<Vec<Activity>> = RefCell::new(Vec::new());
    static COLLAB_REQUESTS: RefCell<Vec<CollabRequest>> = RefCell::new(Vec::new());
    static COLLAB_REQUEST_ID: RefCell<u64> = RefCell::new(1);
    static TASKS: RefCell<Vec<Task>> = RefCell::new(Vec::new());
    static TASK_ID: RefCell<u64> = RefCell::new(1);
}

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

// Artist CRUD
#[ic_cdk::update]
fn register_artist(name: String, bio: String, social: Option<String>, profile_image_url: Option<String>, links: Option<Vec<String>>) -> Option<Artist> {
    if name.trim().is_empty() {
        return None;
    }
    ARTISTS.with(|artists| {
        ARTIST_ID.with(|id| {
            let mut id_mut = id.borrow_mut();
            let artist = Artist {
                id: *id_mut,
                name,
                bio,
                social,
                royalty_balance: 0,
                profile_image_url,
                links,
            };
            artists.borrow_mut().push(artist.clone());
            *id_mut += 1;
            Some(artist)
        })
    })
}

#[ic_cdk::query]
fn get_artist(id: u64) -> Option<Artist> {
    ARTISTS.with(|artists| artists.borrow().iter().find(|a| a.id == id).cloned())
}

#[ic_cdk::update]
fn update_artist(id: u64, name: String, bio: String, social: Option<String>, profile_image_url: Option<String>, links: Option<Vec<String>>) -> Option<Artist> {
    ARTISTS.with(|artists| {
        let mut artists = artists.borrow_mut();
        if let Some(artist) = artists.iter_mut().find(|a| a.id == id) {
            artist.name = name;
            artist.bio = bio;
            artist.social = social;
            artist.profile_image_url = profile_image_url;
            artist.links = links;
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
fn create_track(title: String, description: String, contributors: Vec<u64>) -> Option<Track> {
    if title.trim().is_empty() || description.trim().is_empty() || contributors.is_empty() {
        return None;
    }
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
                tags: vec![],
                genre: None,
                play_count: 0,
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
            Some(track)
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
        if q.is_empty() {
            tracks.borrow().clone()
        } else {
            tracks.borrow().iter().filter(|t| t.title.to_lowercase().contains(&q)).cloned().collect()
        }
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
                    // Debug: log split info
                    ic_cdk::println!("Distributing {} to artist {} ({}%)", share, split.id, split.pct);
                    ARTISTS.with(|artists| {
                        let mut artists = artists.borrow_mut();
                        if let Some(artist) = artists.iter_mut().find(|a| a.id == split.id) {
                            artist.royalty_balance += share;
                            ic_cdk::println!("Updated artist {} balance: {}", artist.id, artist.royalty_balance);
                        } else {
                            ic_cdk::println!("Artist {} not found for royalty distribution", split.id);
                        }
                    });
                }
                track.payments.push(Payment { payer, amount, timestamp });
                distributed = true;
                log_activity(payer, "distribute_payment", timestamp, &format!("Paid {} for track {}", amount, track_id));
            } else {
                ic_cdk::println!("No splits set for track {}", track_id);
            }
        } else {
            ic_cdk::println!("Track {} not found for payment distribution", track_id);
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

// Add a tag to a track
#[ic_cdk::update]
fn add_tag(track_id: u64, tag: String) -> bool {
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            if !track.tags.contains(&tag) {
                track.tags.push(tag);
            }
            return true;
        }
        false
    })
}

// Remove a tag from a track
#[ic_cdk::update]
fn remove_tag(track_id: u64, tag: String) -> bool {
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            track.tags.retain(|t| t != &tag);
            return true;
        }
        false
    })
}

// Set genre for a track
#[ic_cdk::update]
fn set_genre(track_id: u64, genre: String) -> bool {
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            track.genre = Some(genre);
            return true;
        }
        false
    })
}

// Get genre for a track
#[ic_cdk::query]
fn get_genre(track_id: u64) -> Option<String> {
    TRACKS.with(|tracks| {
        tracks.borrow().iter().find(|t| t.id == track_id).and_then(|t| t.genre.clone())
    })
}

// Search tracks by tag
#[ic_cdk::query]
fn search_tracks_by_tag(tag: String) -> Vec<Track> {
    TRACKS.with(|tracks| {
        tracks.borrow().iter().filter(|t| t.tags.contains(&tag)).cloned().collect()
    })
}

// Search tracks by genre
#[ic_cdk::query]
fn search_tracks_by_genre(genre: String) -> Vec<Track> {
    TRACKS.with(|tracks| {
        tracks.borrow().iter().filter(|t| t.genre.as_ref().map(|g| g == &genre).unwrap_or(false)).cloned().collect()
    })
}

// Collaboration Request Endpoints
#[ic_cdk::update]
fn send_collab_request(from: u64, to: u64, track_id: u64, message: Option<String>) -> Option<CollabRequest> {
    let now = ic_cdk::api::time() / 1_000_000;
    COLLAB_REQUESTS.with(|requests| {
        COLLAB_REQUEST_ID.with(|id| {
            let mut id_mut = id.borrow_mut();
            // Prevent duplicate pending requests
            if requests.borrow().iter().any(|r| r.from == from && r.to == to && r.track_id == track_id && r.status == CollabRequestStatus::Pending) {
                return None;
            }
            let req = CollabRequest {
                id: *id_mut,
                from,
                to,
                track_id,
                message,
                status: CollabRequestStatus::Pending,
                timestamp: now,
            };
            requests.borrow_mut().push(req.clone());
            *id_mut += 1;
            Some(req)
        })
    })
}

#[ic_cdk::update]
fn respond_collab_request(request_id: u64, accept: bool) -> Option<CollabRequest> {
    COLLAB_REQUESTS.with(|requests| {
        let mut requests = requests.borrow_mut();
        if let Some(req) = requests.iter_mut().find(|r| r.id == request_id && r.status == CollabRequestStatus::Pending) {
            req.status = if accept { CollabRequestStatus::Accepted } else { CollabRequestStatus::Declined };
            return Some(req.clone());
        }
        None
    })
}

#[ic_cdk::query]
fn list_collab_requests_for_user(user_id: u64) -> Vec<CollabRequest> {
    COLLAB_REQUESTS.with(|requests| {
        requests.borrow().iter().filter(|r| r.to == user_id || r.from == user_id).cloned().collect()
    })
}

// Task Management Endpoints
#[ic_cdk::update]
fn create_task(track_id: u64, assigned_to: u64, description: String) -> Option<Task> {
    if description.trim().is_empty() {
        return None;
    }
    let now = ic_cdk::api::time() / 1_000_000;
    TASKS.with(|tasks| {
        TASK_ID.with(|id| {
            let mut id_mut = id.borrow_mut();
            let task = Task {
                id: *id_mut,
                track_id,
                assigned_to,
                description,
                status: TaskStatus::Open,
                created_at: now,
                updated_at: now,
            };
            tasks.borrow_mut().push(task.clone());
            *id_mut += 1;
            Some(task)
        })
    })
}

#[ic_cdk::update]
fn update_task_status(task_id: u64, status: TaskStatus) -> Option<Task> {
    let now = ic_cdk::api::time() / 1_000_000;
    TASKS.with(|tasks| {
        let mut tasks = tasks.borrow_mut();
        if let Some(task) = tasks.iter_mut().find(|t| t.id == task_id) {
            task.status = status;
            task.updated_at = now;
            return Some(task.clone());
        }
        None
    })
}

#[ic_cdk::query]
fn list_tasks_for_track(track_id: u64) -> Vec<Task> {
    TASKS.with(|tasks| {
        tasks.borrow().iter().filter(|t| t.track_id == track_id).cloned().collect()
    })
}

#[ic_cdk::query]
fn list_tasks_for_user(user_id: u64) -> Vec<Task> {
    TASKS.with(|tasks| {
        tasks.borrow().iter().filter(|t| t.assigned_to == user_id).cloned().collect()
    })
}

// Royalty withdrawal endpoint
#[ic_cdk::update]
fn withdraw_royalties(artist_id: u64, amount: u64) -> bool {
    if amount == 0 {
        return false;
    }
    ARTISTS.with(|artists| {
        let mut artists = artists.borrow_mut();
        if let Some(artist) = artists.iter_mut().find(|a| a.id == artist_id) {
            if artist.royalty_balance >= amount {
                artist.royalty_balance -= amount;
                let now = ic_cdk::api::time() / 1_000_000;
                log_activity(artist_id, "withdraw_royalties", now, &format!("Withdrew {} tokens", amount));
                // In production, integrate with ICP ledger here
                return true;
            }
        }
        false
    })
}

// Analytics: increment play count
#[ic_cdk::update]
fn increment_play_count(track_id: u64) -> bool {
    TRACKS.with(|tracks| {
        let mut tracks = tracks.borrow_mut();
        if let Some(track) = tracks.iter_mut().find(|t| t.id == track_id) {
            track.play_count += 1;
            return true;
        }
        false
    })
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct TrackAnalytics {
    pub play_count: u64,
    pub revenue: u64,
    pub comments_count: u64,
    pub ratings_count: u64,
    pub avg_rating: u8,
}

#[ic_cdk::query]
fn get_track_analytics(track_id: u64) -> Option<TrackAnalytics> {
    TRACKS.with(|tracks| {
        tracks.borrow().iter().find(|t| t.id == track_id).map(|t| {
            let revenue: u64 = t.payments.iter().map(|p| p.amount).sum();
            let comments_count = t.comments.len() as u64;
            let ratings_count = t.ratings.len() as u64;
            let avg_rating = if ratings_count > 0 {
                (t.ratings.iter().map(|(_, r)| *r as u32).sum::<u32>() / ratings_count as u32) as u8
            } else { 0 };
            TrackAnalytics {
                play_count: t.play_count,
                revenue,
                comments_count,
                ratings_count,
                avg_rating,
            }
        })
    })
}
