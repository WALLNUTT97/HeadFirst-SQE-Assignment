# Test Plan: Striive-4xxx – Add Cover Letter to Profile Page

## 1. Overview

This test plan covers the new Cover Letter functionality in Striive

The feature allows a user to add a cover letter to their profile in one of two ways:

1. Uploading a file: `pdf`, `docx`, or `html`, with a maximum size of `5MB`.
2. Entering cover letter text manually in a free-text field.

Once saved, the cover letter should be displayed correctly on the profile page:

- As a file attachment when uploaded as a file.
- As non-editable text when entered manually.

The cover letter should also be available during job application flows, depending on the applicable business rules.

---

## 2. Objectives

The main objectives of feature are to add functionality to the profile section to:

- Allow users to edit, upload, replace, and view a cover letter.
- Limit users to certain files types and sizes for cover letter upload.
- Free-text cover letters as an alternative to file cover letters.
- Allow users to use their cover letter(s) when applying for a job.
- Disallow users to use their cover letter(s) when applying for a job depending on some other rules.

---

## 3. Scope

### In scope

- New cover letter section.
- Edit functionality to cover letter.
    - Upload cover letter with the following restrictions:
        - File upload validation for `pdf`, `docx`, and `html`.
        - Maximum upload size validation of `5MB`.
    - Free text cover letter input with the following restrictions:
        - Maximum of 3000 characters long.
- Save and persistence behavior.
- Ability to upload and replace.
- Ability to use cover letter during job application flows.


- Error messages, validation, and edge cases.
- Basic accessibility, security, performance, and compatibility checks.

### Out of scope

- Full regression testing of unrelated profile sections such as education, skills, resumes, or work experience.
- Deep content validation of uploaded documents beyond supported type, size, storage, and retrieval.
- Full end-to-end testing of the complete job application process, except where cover letter behaviour is involved.

---

## 4. Assumptions and open questions

The acceptance criteria leave a few areas that should be clarified with the different teams within the orginisation.

| Area | Question | Why it matters |
|---|---|---|
| File vs text | Can a user have both an uploaded cover letter and a text cover letter at the same time, or only one active option? | Impacts validation, UI state, and application flow testing. |
| Multilingual| Can a user have a cover letter in both English and Dutch as it is available for resume | Impacts validation, already a feature for resume. |
| Replacement | Can a user replace an existing cover letter? | Impacts update scenarios, already an established feature for resume. |
| Deletion | Can a user remove a saved cover letter entirely? | Impacts profile and application behaviour. |
| HTML upload | Should uploaded HTML be rendered, downloaded, or previewed as a file only? | Important for security and XSS risk. Could lead to easy injection attacks. |
| Application rules | What are the “some other rules” that decide whether a cover letter can be used when applying? | Required for accurate application-flow testing. |
| File validation | What are we basing file validation on? | Prevents bypassing upload restrictions. |
| Existing users | What should happen for users who already have profile data but no cover letter? | Needed for migration/backward compatibility testing. |
| Links | How do we handle hyperlinks in the freetext box? | Security risk concern |

---

## 5. Test approach

Testing should be performed at multiple levels:

- **Requirement review:** Identify gaps and clarify acceptance criteria with key stakeholders before development begins. Start conversation on usability, target audience and how they will use this feature.
- **Unit testing:** Validate file type checks, file size checks, text validation, and cover letter business rules.
- **API testing:** Validate create, update, fetch, and delete behaviour for cover letter data.
- **UI functional testing:** Validate the user journey in edit profile, view profile, and job application flows for both file upload and free text cover letters.
- **Regression testing:** Confirm existing resume/profile functionality is not affected negatively.
- **Non-functional testing:** Validate security, accessibility, usability, compatibility, and performance.

---

## 6. Test environments

| Environment | Purpose |
|---|---|
| Dev | Developer/unit-level validation |
| Test | Main functional, UI, API, regression, and integration testing. |
| Staging/pre-production | Final validation with production-like data and configuration. |

Test accounts should include:

- User with no existing resume or cover letter.
- User with an existing resume but no cover letter.
- User with an uploaded cover letter.
- User with a text-based cover letter.
- User applying for a job where a cover letter is allowed.
- User applying for a job where a cover letter is not allowed by rule.

---

## 7. Test data

| Data type | Examples |
|---|---|
| Valid files | `cover-letter.pdf`, `cover-letter.docx`, `cover-letter.html` under 5MB. |
| Boundary files | File exactly 5MB, file just under 5MB, file just over 5MB. |
| Invalid files | `.txt`, `.jpg`, `.png`, `.exe`, `.zip`, `.js`. |
| Disguised files | `malware.pdf.exe`, `.jpg` renamed to `.pdf` |
| Text input | Short text, multi-paragraph text, text with special characters, very long text. |
| Security input | Script tags, HTML injection attempts, SQL-like strings, encoded payloads. |

---

## 8. Functional test scenarios

### 8.1 Edit profile – cover letter section

| ID | Scenario | Expected result |
|---|---|---|
| CL-001 | Open edit profile as a logged-in user | Cover letter section is visible in **My resume & skills** |
| CL-002 | Open edit profile as a user with no cover letter | Empty state is shown with options to upload a file or enter text |
| CL-003 | Open edit profile as a user with existing uploaded cover letter | Existing file is shown with correct file name and available actions |
| CL-004 | Open edit profile as a user with existing text cover letter | Existing text is shown in the expected editable state in edit mode |
| CL-005 | Save profile without adding a cover letter | Profile saves successfully if cover letter is optional |

### 8.2 File upload

| ID | Scenario | Expected result |
|---|---|---|
| CL-006 | Upload a valid PDF under 5MB and save | File is saved and displayed as a file |
| CL-007 | Upload a valid DOCX under 5MB and save | File is saved and displayed as a file |
| CL-008 | Upload a valid HTML file under 5MB and save | File is saved and displayed as a file |
| CL-009 | Upload a file just under 5MB | File is accepted |
| CL-010 | Upload a file just over 5MB | File is rejected with a clear error message |
| CL-011 | Upload unsupported file type such as `.txt` | File is rejected with a clear error message |
| CL-012 | Upload file with double extension such as `cover.pdf.exe` | File is rejected |
| CL-013 | Upload empty/corrupted file | File is rejected or handled gracefully with a clear error |
| CL-014 | Replace existing uploaded cover letter with another valid file | New file replaces old file after save |
| CL-015 | Cancel edit after selecting a new file | Existing saved cover letter remains unchanged |
| CL-016 | Remove an uploaded cover letter, if supported | Cover letter is removed after save |

### 8.3 Free-text cover letter

| ID | Scenario | Expected result |
|---|---|---|
| CL-017 | Enter valid free-text cover letter and save, include muilti-paragraph text, special character, leading/trailing spaces and any other edge case text input | Text is saved successfully and stylisation is handled correctly |
| CL-018 | Enter maximum allowed text length | Text is accepted |
| CL-019 | Enter text above maximum allowed length | Save is blocked with clear validation message |
| CL-020 | Enter script tags or HTML in text field | Content is escaped and does not execute |
| CL-021 | Replace existing text cover letter with new text | Updated text is saved and displayed |
| CL-022 | Cancel edit after changing text | Previously saved text remains unchanged |

### 8.4 Interaction between file and text options

| ID | Scenario | Expected result |
|---|---|---|
| CL-023 | Upload cover letter with free-text cover letter already saved | Newest cover letter is displayed |
| CL-024 | Add free-text cover letter with already uploaded file cover letter | Newest cover letter is displayed |
| CL-025 | User attempts to save both file and text where only one is allowed | User receives clear validation or selection behaviour prevents this state | (if test case is even possible)
| CL-026 | User switches between options before saving | Only the final selected option is saved |

### 8.5 View profile

| ID | Scenario | Expected result |
|---|---|---|
| CL-027 | View profile with uploaded cover letter | Cover letter is displayed as a file |
| CL-028 | View profile with text cover letter | Cover letter is displayed as non-editable text |
| CL-029 | View profile with no cover letter | No broken empty component is shown; empty state is handled cleanly |
| CL-030 | Download/open uploaded cover letter, if supported | Correct file is opened/downloaded |
| CL-031 | Attempt to edit text from view mode | Text is not editable from view mode |
| CL-032 | Refresh page after saving cover letter | Saved cover letter still appears correctly |
| CL-033 | Log out and log back in | Saved cover letter persists |

### 8.6 Job application flow

| ID | Scenario | Expected result |
|---|---|---|
| CL-034 | Apply for a job with saved uploaded cover letter | User can choose whether to include the cover letter, if rules allow |
| CL-035 | Apply for a job with saved text cover letter | User can choose whether to include the cover letter, if rules allow |
| CL-036 | Apply for a job with no saved cover letter | Application flow handles missing cover letter correctly |
| CL-037 | Apply where cover letter is required | User cannot submit without adding/selecting a cover letter |
| CL-038 | Apply where cover letter is optional | User can submit with or without cover letter |
| CL-039 | Apply where cover letter is not allowed by business rules | Cover letter is not selectable or not sent |
| CL-040 | Review summary before applying | Summary accurately reflects whether cover letter is included |

---

## 9. API and integration testing

API coverage should confirm that the front end and back end handle the same rules consistently.

| ID | Scenario | Expected result |
|---|---|---|
| API-001 | Create cover letter using valid file payload | API returns success and stores file metadata correctly |
| API-002 | Create cover letter using valid text payload | API returns success and stores text correctly |
| API-003 | Fetch saved uploaded cover letter | API returns correct file metadata/reference |
| API-004 | Fetch saved text cover letter | API returns correct text data |
| API-005 | Update cover letter from file to text | API updates state correctly |
| API-006 | Update cover letter from text to file | API updates state correctly |
| API-007 | Delete cover letter, if supported | API removes cover letter and fetch returns empty state |
| API-008 | Submit job application with cover letter | Application payload contains correct cover letter reference |
| API-009 | Submit job application without cover letter | Application payload excludes cover letter |
| API-010 | Attempt unsupported file upload directly through API | API rejects request even if UI validation is bypassed |
| API-011 | Attempt oversized file upload directly through API | API rejects request even if UI validation is bypassed |
| API-012 | Unauthorized user attempts to access another user's cover letter | API returns unauthorized/forbidden |

---

## 10. Non-functional testing

### 10.1 Security

- Validate file type server-side, not only client-side.
- Validate file MIME type and, where possible, file signature.
- Ensure uploaded HTML cannot execute scripts in the Striive application context.
- Escape/sanitize all free-text content before display.
- Confirm one user cannot access another user's uploaded cover letter.
- Confirm uploaded file URLs are not publicly accessible unless intentionally designed that way.
- Virus/malware scanning should be considered for uploaded files.

### 10.2 Performance

- Uploading a valid file under 5MB should complete within an acceptable response time on a normal connection.
- Saving text cover letter should not noticeably slow down the profile save action.
- Viewing profile should not be delayed by cover letter retrieval.
- Large allowed files should not degrade profile page load performance.

### 10.3 Accessibility

- File upload and text fields should have accessible labels.
- Validation errors should be displayed clearly to users.
- Colour should not be the only way to communicate validation state.

### 10.4 Usability

- The user should clearly understand the accepted file types and max size before uploading.
- Error messages should explain what went wrong and how to fix it.
- The UI should make it clear whether the saved cover letter is a file or text.
- The job application flow should clearly show whether the cover letter will be included.

### 10.5 Compatibility

Test on supported combinations, for example:

- Chrome, Firefox, Safari, and Edge.
- Desktop and mobile responsive layouts.
- Windows and macOS for file upload behaviour.

---

## 11. Regression testing

The following existing areas should be regression tested:

- Existing resume upload and display.
- Existing skills/profile edit and save behaviour.
- Profile view page layout.
- Job application submission without cover letter.
- Existing document/file upload components, if reused.
- Authentication and user profile permissions.

---

## 12. Automation candidates

Good candidates for automation:

- Upload valid PDF/DOCX/HTML under 5MB.
- Reject unsupported file type.
- Reject file over 5MB.
- Save text cover letter and verify it appears as non-editable text in view mode.
- Verify persistence after refresh/logout-login.
- Verify cover letter selection in job application summary.
- API tests for direct validation bypass attempts.

---

## 13. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Unclear business rules for job applications | Incorrect or incomplete testing | Clarify rules during refinement before development completes. |
| HTML upload introduces XSS risk | High security impact | Treat HTML as downloadable file or sanitize/render safely. Test malicious HTML. |
| Client-only validation | Users can bypass restrictions | Add API/server-side validation and API negative tests. |
| File storage permissions misconfigured | Private documents may be exposed | Test authorization and file URL access. |
| UI layout breaks on profile page | Poor user experience | Validate edit/view pages across responsive breakpoints. |
| Ambiguous file/text behaviour | Confusing UX and inconsistent data | Agree whether only one active cover letter is allowed. |

---

## 14. Entry and exit criteria

### Entry criteria

- Acceptance criteria are reviewed and clarified.
- Designs for edit and view states are available.
- Test environment is available.
- Test users and test files are prepared.
- API contract is available or agreed.

### Exit criteria

- All critical and high-priority tests pass.
- No open critical or high-severity defects remain.
- Agreed functional and non-functional coverage is complete.
- Regression testing of related profile and application flows is complete.
- PO/BA/design have reviewed any behaviour that differs from the original assumptions.

---

## 15. Collaboration throughout the sprint

I would approach this as a shared quality responsibility across the sprint, rather than something tested only at the end.

### Design/refinement phase

During refinement, I would review the acceptance criteria with the PO, BA, Designer, and Developers to identify gaps early. The main areas I would clarify are whether users can have both a file and text cover letter, how replacement/removal should work, what the job application business rules are, and how uploaded HTML should be handled safely.

I would also review the design states with Design, including empty state, saved file state, saved text state, validation errors, loading state, and responsive behaviour. This helps avoid late rework once development has already started.

### Development phase

During development, I would work closely with the developers to agree the test approach across unit, API, and UI levels. I would encourage server-side validation for file type, file size, authorization, and text sanitization, rather than relying only on the browser.

I would also prepare test data and automation fixtures early, so that testing can begin as soon as the first testable increment is available. If the team uses pull requests, I would review the implementation against the agreed acceptance criteria and add comments where edge cases or testability concerns are missing.

### Testing phase

As functionality becomes available, I would test in small increments instead of waiting for a complete handover. For example, I would first validate the edit-profile save behaviour, then the view-profile display, and finally the job application integration.

Any defects would be raised with clear reproduction steps, expected vs actual behaviour, test data, screenshots or network payloads where useful, and a suggested severity based on user impact.

### Sprint completion

Before sign-off, I would review the completed functionality with the PO/BA and confirm that all clarified rules are covered. I would also make sure the most valuable regression and automation checks are either completed or added to the team's backlog with a clear priority.

This approach helps protect both quality and timeline by finding ambiguity early, testing continuously, and keeping the team aligned on what “done” means for the feature.
