# Testing Guide - LMS Overhaul

## Overview
This guide provides a comprehensive testing checklist for all the new features implemented in the LMS overhaul.

---

## Pre-Testing Checklist

### 1. Environment Setup
- [ ] Docker containers are running (`docker-compose up`)
- [ ] Database migration has been applied
- [ ] Admin user exists (admin@themamboinn.com / admin123)
- [ ] At least one test course exists

### 2. Database Verification
```sql
-- Check if new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lessons' 
AND column_name IN ('week_number', 'day_number', 'content_json');
```

---

## Phase 1: Database Schema Testing

### Test 1.1: Verify Migration
- [ ] Run migration script: `python backend/migrate_add_lesson_fields.py`
- [ ] Verify columns exist in database
- [ ] Verify indexes are created

### Test 1.2: Backward Compatibility
- [ ] Existing lessons should still work (week/day can be null)
- [ ] Existing lessons should still display correctly

---

## Phase 2: Prerequisites Removal Testing

### Test 2.1: Lesson Access
- [ ] Access lesson 1 in a course
- [ ] Access lesson 2 without completing lesson 1 (should work now)
- [ ] Access any lesson in any order (should work)
- [ ] Verify subscription checks still work (paywall remains)

### Test 2.2: API Endpoints
- [ ] `GET /api/courses/lessons/{id}` - Should not return 403 for prerequisites
- [ ] `GET /api/courses/worlds/{id}/lessons` - All lessons should have `is_locked: false`
- [ ] `POST /api/progress/lessons/{id}/complete` - Should not check prerequisites

---

## Phase 3: Backend API Testing

### Test 3.1: Lesson Endpoints with New Fields
- [ ] `GET /api/courses/lessons/{id}` - Verify response includes week_number, day_number, content_json
- [ ] `GET /api/courses/worlds/{id}/lessons` - Verify response includes new fields
- [ ] `GET /api/admin/courses/{id}/full` - Verify response includes new fields

### Test 3.2: Admin Endpoints
- [ ] `POST /api/admin/levels/{id}/lessons` - Create lesson with week/day/content_json
- [ ] `PUT /api/admin/lessons/{id}` - Update lesson with week/day/content_json
- [ ] Verify data is saved correctly in database

---

## Phase 4: Admin Students Page Testing

### Test 4.1: Students Endpoint
- [ ] `GET /api/admin/students` - Returns list of students
- [ ] `GET /api/admin/students?search=john` - Search functionality works
- [ ] Verify response includes: id, email, name, xp, level, streak, created_at, role

### Test 4.2: Students UI
- [ ] Navigate to `/admin/students`
- [ ] Verify table displays all student information
- [ ] Test search functionality
- [ ] Verify pagination (if applicable)

---

## Phase 5: Admin Settings Page Testing

### Test 5.1: Settings Page
- [ ] Navigate to `/admin/settings`
- [ ] Verify placeholder content displays
- [ ] Verify page is accessible from sidebar

---

## Phase 6: Course Builder - Week/Day Sorting Testing

### Test 6.1: Week/Day Input
- [ ] Navigate to `/admin/builder?id={course_id}`
- [ ] Edit a lesson's week number
- [ ] Edit a lesson's day number
- [ ] Verify changes save immediately
- [ ] Reload page - verify week/day values persist

### Test 6.2: Grouping Display
- [ ] Set multiple lessons to Week 1, Day 1
- [ ] Set multiple lessons to Week 1, Day 2
- [ ] Set one lesson to Week 2, Day 1
- [ ] Verify lessons group correctly
- [ ] Verify "Week X • Day Y" headers appear
- [ ] Verify ungrouped lessons appear in separate section

### Test 6.3: Sorting
- [ ] Create lessons with different week/day combinations
- [ ] Verify lessons are sorted: Week 1 Day 1, Week 1 Day 2, Week 2 Day 1, etc.
- [ ] Verify ungrouped lessons appear last

---

## Phase 7: Rich Content Builder Testing

### Test 7.1: Content Editor Access
- [ ] Click "Edit Content" button on a lesson
- [ ] Verify modal opens
- [ ] Verify existing content loads (if any)

### Test 7.2: Video Block
- [ ] Add video block
- [ ] Enter video URL
- [ ] Save and verify it saves
- [ ] Add video block with embed code
- [ ] Save and verify it saves

### Test 7.3: Text Block
- [ ] Add text block
- [ ] Enter markdown content
- [ ] Change format to HTML
- [ ] Change format to Plain
- [ ] Save and verify

### Test 7.4: Image Block
- [ ] Add image block
- [ ] Enter image URL
- [ ] Add alt text
- [ ] Add caption
- [ ] Save and verify

### Test 7.5: Quiz Block
- [ ] Add quiz block
- [ ] Add quiz title
- [ ] Add question 1 with 3 options
- [ ] Set correct answer
- [ ] Add explanation
- [ ] Add question 2
- [ ] Add/remove options
- [ ] Save and verify

### Test 7.6: Block Management
- [ ] Add multiple blocks of different types
- [ ] Move block up
- [ ] Move block down
- [ ] Delete a block
- [ ] Verify order persists after save

### Test 7.7: Content Persistence
- [ ] Create rich content with all block types
- [ ] Save content
- [ ] Reload page
- [ ] Open content editor again
- [ ] Verify all content loads correctly

---

## Phase 8: Student View Testing

### Test 8.1: Course Listing - Week/Day Grouping
- [ ] Navigate to `/courses/{course_id}`
- [ ] Verify lessons are grouped by Week/Day
- [ ] Verify "Week X • Day Y" headers appear
- [ ] Verify ungrouped lessons appear in "Other Lessons" section
- [ ] Verify lesson cards display correctly

### Test 8.2: Lesson View - Rich Content Rendering
- [ ] Navigate to a lesson with rich content
- [ ] Verify Week/Day displays in header
- [ ] Verify video blocks render correctly
- [ ] Verify text blocks render correctly (markdown/HTML)
- [ ] Verify image blocks render with captions
- [ ] Verify quiz blocks are interactive

### Test 8.3: Quiz Interaction
- [ ] Navigate to lesson with quiz
- [ ] Select answers for all questions
- [ ] Click "Submit Quiz"
- [ ] Verify correct answers are highlighted green
- [ ] Verify wrong answers are highlighted red
- [ ] Verify score displays
- [ ] Verify explanations appear (if provided)

### Test 8.4: Fallback Behavior
- [ ] Navigate to lesson without rich content
- [ ] Verify description tab appears
- [ ] Verify description content displays
- [ ] Verify discussion tab works

### Test 8.5: Video Playback
- [ ] Navigate to lesson with video block
- [ ] Click play button
- [ ] Verify video plays
- [ ] Test with video URL
- [ ] Test with embed code (if applicable)

---

## Integration Testing

### Test I.1: End-to-End Content Creation
1. [ ] Admin creates lesson with Week 1, Day 1
2. [ ] Admin adds rich content (video, text, image, quiz)
3. [ ] Admin saves lesson
4. [ ] Student views course - sees lesson in "Week 1 • Day 1" group
5. [ ] Student opens lesson - sees rich content rendered correctly
6. [ ] Student completes quiz - sees score and feedback

### Test I.2: Week/Day Organization
1. [ ] Admin creates multiple lessons
2. [ ] Admin assigns Week/Day values
3. [ ] Student views course - sees proper grouping
4. [ ] Verify lessons are sorted correctly

### Test I.3: Backward Compatibility
1. [ ] Existing lessons (without week/day) still display
2. [ ] Existing lessons (without rich content) still work
3. [ ] No errors when accessing old lessons

---

## Performance Testing

### Test P.1: Large Content
- [ ] Create lesson with 10+ content blocks
- [ ] Verify page loads in reasonable time
- [ ] Verify content editor handles large content

### Test P.2: Many Lessons
- [ ] Course with 50+ lessons
- [ ] Verify grouping performance
- [ ] Verify page load time

---

## Error Handling Testing

### Test E.1: Invalid Data
- [ ] Try to save lesson with invalid week/day values
- [ ] Try to save invalid JSON in content_json
- [ ] Verify appropriate error messages

### Test E.2: Missing Data
- [ ] Access lesson with null content_json
- [ ] Access lesson with empty content_json.blocks
- [ ] Verify graceful fallback

---

## Browser Compatibility

### Test B.1: Modern Browsers
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

### Test B.2: Responsive Design
- [ ] Mobile view (< 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (> 1024px)

---

## Security Testing

### Test S.1: Admin Access
- [ ] Non-admin users cannot access admin pages
- [ ] Admin endpoints require authentication
- [ ] Students cannot edit content

### Test S.2: Data Validation
- [ ] XSS prevention in rich content
- [ ] SQL injection prevention
- [ ] Input sanitization

---

## Quick Test Script

Run these commands to quickly verify the implementation:

```bash
# 1. Check database migration
docker-compose exec backend python migrate_add_lesson_fields.py

# 2. Test API endpoints (replace with actual IDs)
curl -H "Authorization: Bearer {token}" http://localhost:8000/api/admin/students
curl -H "Authorization: Bearer {token}" http://localhost:8000/api/courses/lessons/{lesson_id}

# 3. Check frontend compilation
cd frontend && npm run build
```

---

## Known Issues / Notes

- Quiz component is client-side only (scores not saved to database)
- Markdown rendering is basic (consider react-markdown for full support)
- Video embed code requires trusted sources (security consideration)

---

## Test Results Template

```
Date: __________
Tester: __________

Phase 1: Database Schema - [ ] Pass [ ] Fail
Phase 2: Prerequisites Removal - [ ] Pass [ ] Fail
Phase 3: Backend API - [ ] Pass [ ] Fail
Phase 4: Admin Students - [ ] Pass [ ] Fail
Phase 5: Admin Settings - [ ] Pass [ ] Fail
Phase 6: Course Builder - [ ] Pass [ ] Fail
Phase 7: Rich Content Builder - [ ] Pass [ ] Fail
Phase 8: Student View - [ ] Pass [ ] Fail

Overall: [ ] Pass [ ] Fail

Notes:
_________________________________
_________________________________
```

