# PubSub

Dostupno na linku: https://pubsub-51xj.onrender.com/

# Requirements

| ID       | REQUIREMENT                                                                                     | GROUP                  | STATUS |
|----------|-------------------------------------------------------------------------------------------------|------------------------|--------|
| UM-01    | The system must allow users to register using email and password.                               | User Management        | DONE   |
| UM-02    | The system must allow users to log in and log out.                                               | User Management        | DONE   |
| UM-03    | The system must allow users to view and edit their profile.                                     | User Management        | DONE   |
| UM-04    | The system must allow users to delete their account.                                             | User Management        | DONE   |
| UM-05    | The system must allow users to view other users’ basic information such as name, total score, and profile picture. | User Management        | DONE   |
| RM-01    | The system must provide real-time chat functionality within rooms.                              | Room Management        | DONE   |
| RM-02    | The system must allow users to join and leave rooms.                                             | Room Management        | DONE   |
| RM-03    | The system must automatically and randomly select quiz questions from the database in every non-empty room. | Room Management        | DONE   |
| RM-04    | The system should include a countdown timer for each question. If no answer is submitted within the predefined time period, the system must provide a hint. | Room Management        | DONE   |
| RM-05    | The system must allow users to submit answers to quiz questions.                                | Room Management        | DONE   |
| RM-06    | The system must award points to users who answer correctly.                                      | Room Management        | DONE   |
| RM-07    | The system must update and display users’ scores in real-time in the room.                       | Room Management        | DONE   |
| RM-08    | The system must allow users to browse available rooms.                                           | Room Management        | DONE   |
| RM-09    | The system must allow admins to create and delete rooms.                                         | Room Management        | DONE   |
| QM-01    | The system must allow users to create questions with text and optionally images. It is mandatory to add categories for each question. | Question Management    | DONE   |
| QM-02    | The system must allow admins to review, approve, or reject user-submitted questions.            | Question Management    | DONE   |
| QM-03    | The system must allow admins to provide hints and correct answers for questions.                | Question Management    | DONE   |
| AC-01    | The system must allow different admin levels to control content, game rules, and user actions.   | Admin Controls         | DONE   |
| AC-02    | The system must allow admins to mute or unmute users.                                             | Admin Controls         | DONE   |
| AC-03    | The system must allow admins to ban or unban users.                                               | Admin Controls         | DONE   |
| AC-04    | The system must provide admins with a dashboard showing users, questions, and system status.     | Admin Controls         | DONE   |
| AC-05    | The system must allow admins to perform bulk updates on users.                                   | Admin Controls         | DONE   |
| CM-01    | The system must prevent banned or muted users from interacting in chat.                          | Content Moderation     | DONE   |
| CM-02    | The system must confirm user actions like deleting accounts or changing admin levels.            | Content Moderation     | DONE   |
| SF-01    | The system must schedule automatic unban/unmute operations.                                      | Support & Feedback     | DONE   |
| NFR-01   | The system must support multiple concurrent rooms and users without performance degradation.     | Scalability            | DONE   |
| NFR-02   | The system must deliver chat messages with minimal latency.                                      | Performance            | DONE   |
| NFR-03   | The system must store sensitive user data securely.                                              | Security               | DONE   |
| NFR-04   | The system must maintain reliable uptime for all users.                                          | Availability           | DONE   |
| LL-01    | The system must introduce user levels based on accumulated experience points (XP).               | Leveling & Leaderboards | DONE   |
| LL-02    | The system must display the user's level in rooms.                                                 | Leveling & Leaderboards | DONE   |
| LL-03    | The system must provide a global leaderboard based on accumulated points or XP.                   | Leveling & Leaderboards | DONE   |
| GT-01    | The system must support multiple game modes.                                                    | Game Types             | IDLE   |
| PR-01    | The system must allow admins to create private rooms protected by a password.                     | Room Management        | DONE   |
| PR-02    | The system must restrict access to private rooms only to users who enter the correct password.   | Room Management        | DONE   |
| PR-03    | The system must show number of users for each room.                                                | Room Management        | DONE   |
| TM-01    | The system must allow users to create or join teams.                                             | Teams                  | IDLE   |
| TM-02    | The system must provide team-only chat channels.                                                 | Teams                  | IDLE   |
| TM-03    | The system must support team vs. team game modes.                                                | Teams                  | IDLE   |
| TM-04    | The system must provide a monthly team leaderboard.                                              | Teams                  | IDLE   |
| TM-05    | The system must allow awarding monthly rewards to top-performing teams.                          | Teams                  | IDLE   |
| ST-01    | The system must track user streaks based on continuous daily activity.                           | User Activity          | DONE   |
| ST-02    | The system must reward users with streak bonuses, XP, or badges.                                 | User Activity          | DONE   |
| ST-03    | The system must break a streak if a user is inactive for a full day.                             | User Activity          | DONE   |
| RP-02    | The system must allow users to report other users for inappropriate behavior.                    | Reporting              | DONE   |
| RP-03    | The system should automatically detect and flag inappropriate chat messages.                       | Reporting              | DONE   |
| RP-04    | The system must provide admins with a dashboard listing all reports and flagged content.        | Reporting              | DONE   |
| STATS-01 | The system must store detailed statistics about user performance.                                | Statistics             | IDLE   |
| STATS-02 | The system should display charts and graphs on the user's profile based on historical performance data. | Statistics             | IDLE   |
| FR-01    | The system must allow users to send and accept friend requests.                                  | Friends                | DONE   |
| FR-02    | The system must allow users to remove friends users.                                             | Friends                | DONE   |
| PM-01    | The system must provide private one-on-one messaging between friends.                            | Messaging              | IDLE   |
| PM-02    | The system must store and load message history between friends.                                  | Messaging              | IDLE   |
| NW-01    | The system must allow publishing news related to quiz events in Croatia.                         | News                   | IDLE   |
| NW-02    | The system must allow users to comment on published news or articles.                            | News                   | IDLE   |
| NW-03    | The system must allow admins to highlight important news items.                                  | News                   | IDLE   |
| NW-04    | The system must introduce a Content Creator or Editor role.                                       | News                   | IDLE   |
| NW-05    | The system must allow users to request creator/editor access.                                     | News                   | IDLE   |
| NW-06    | The system must allow admins to approve or reject creator/editor requests.                        | News                   | IDLE   |
| NW-07    | The system must allow reporting of news articles or comments.                                    | News                   | IDLE   |
| NW-08    | The system must allow admins to delete or edit articles or comments.                             | News                   | IDLE   |
| UX-04    | The system must provide a fully responsive interface optimized for mobile devices.               | User Experience        | IDLE   |
| UX-05    | The system shall display clear and informative error messages to users.                          | User Experience        | IDLE   |
| EV-01    | The system must allow administrators to schedule Happy Hours events.                             | Events                 | IDLE   |
| SF-02    | The system must allow the user to give feedback or ideas for new features.                        | Support & Feedback     | IDLE   |
| RM-10    | The system must provide users the option to prevent viewing messages sent by others.             | Room Management        | DONE   |
| SF-03    | The system must prevent users from spamming in chat.                                              | Support & Feedback     | DONE   |
| UM-06    | The system must allow users to search for other registered users.                               | User Management        | DONE   |

