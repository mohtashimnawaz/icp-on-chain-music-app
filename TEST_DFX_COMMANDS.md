# TuneSphere: DFX Test Commands

This document provides ready-to-use `dfx canister call` commands to test all major backend functions of the TuneSphere. Adjust IDs as needed based on your test data.

---

## 1. Register Artists
```bash
dfx canister call icp-music-platform-backend register_artist '("Alice", "Bio of Alice", null, null, null)'
dfx canister call icp-music-platform-backend register_artist '("Bob", "Bio of Bob", null, null, null)'
```

## 2. List All Artists
```bash
dfx canister call icp-music-platform-backend list_artists
```

## 3. Create Tracks
```bash
# Assume Alice's artist ID is 0, Bob's is 1
dfx canister call icp-music-platform-backend create_track '("My First Track", "A cool song", vec { 0 })'
dfx canister call icp-music-platform-backend create_track '("Collab Track", "A collaboration", vec { 0; 1 })'
```

## 4. List All Tracks
```bash
dfx canister call icp-music-platform-backend list_tracks
```

## 5. Add Comments to a Track
```bash
# Assume track ID is 0, Alice's artist ID is 0
dfx canister call icp-music-platform-backend add_comment '(0, 0, "Great work!")'
```

## 6. Set Track Splits
```bash
# 100% to Alice for track 0
dfx canister call icp-music-platform-backend set_track_splits '(0, vec { record { id = 0; pct = 100 } })'
```

## 7. Distribute Payment
```bash
# Distribute 1000 units from Alice to track 0 at a sample timestamp
dfx canister call icp-music-platform-backend distribute_payment '(0, 0, 1000, 1719000000)'
```

## 8. Add a Track Version
```bash
dfx canister call icp-music-platform-backend add_track_version '(0, "My First Track v2", "Updated description", vec { 0 })'
```

## 9. Search Tracks by Title
```bash
dfx canister call icp-music-platform-backend search_tracks_by_title '("First")'
```

## 10. Invite a User to a Track
```bash
# Invite Bob (artist ID 1) to track 0
dfx canister call icp-music-platform-backend invite_user '(0, 1)'
```

## 11. Rate a Track
```bash
# Alice (ID 0) rates track 0 with 5 stars
dfx canister call icp-music-platform-backend rate_track '(0, 0, 5)'
```

## 12. Get Track Analytics
```bash
dfx canister call icp-music-platform-backend get_track_analytics '(0)'
```

---

## More Functions

Refer to your .did file for additional endpoints such as:
- update_artist
- update_track
- delete_track
- get_artist, get_track
- set/get track visibility
- assign_role, get_user_role
- add/remove tag, set/get genre
- collaboration requests (send_collab_request, respond_collab_request, list_collab_requests_for_user)
- task management (create_task, update_task_status, list_tasks_for_track, list_tasks_for_user)
- withdraw_royalties, increment_play_count, get_user_activity, get_recent_activity, etc.

You can use the same format as above to test these endpoints.

---

**Tip:** Use the output IDs from earlier commands as input for later ones. For optional values, use `null`. For vectors, use `vec { ... }`. For records, use `record { field = value }`. 