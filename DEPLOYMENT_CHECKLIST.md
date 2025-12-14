# Flowglad Integration - Deployment Checklist

Use this checklist when deploying the Flowglad integration to production.

---

## Pre-Deployment

### 1. Flowglad Setup

- [ ] Create Flowglad account at https://flowglad.com
- [ ] Configure subscription plans in Flowglad dashboard:
  - [ ] Free plan: $0/mo, 2 events, 5 AI gens, 5% fee
  - [ ] Pro plan: $29/mo, unlimited events, 50 AI gens, 3% fee
  - [ ] Enterprise plan: Custom pricing
- [ ] Set up usage metrics:
  - [ ] `events_created` metric
  - [ ] `ai_generations` metric
- [ ] Get API credentials from Flowglad dashboard
- [ ] (Optional) Configure webhooks for subscription events

### 2. Environment Variables

- [ ] Add to production environment:
  ```bash
  FLOWGLAD_API_KEY=prod_xxxxxxxxxxxx
  FLOWGLAD_API_URL=https://api.flowglad.com
  NEXT_PUBLIC_FLOWGLAD_PUBLISHABLE_KEY=pk_xxxxxxxxxxxx
  ```
- [ ] Verify other required env vars:
  - [ ] `ANTHROPIC_API_KEY` (for AI features)
  - [ ] `STRIPE_SECRET_KEY` (for payments)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (for database)
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Database Migration

- [ ] Backup current production database
- [ ] Run `supabase/migrations/001_add_users_table.sql` in production Supabase
- [ ] Verify migration succeeded:
  - [ ] `users` table exists
  - [ ] `events.user_id` column exists
  - [ ] Existing events migrated to users
  - [ ] Indexes created
  - [ ] RLS policies applied
- [ ] Test database queries work as expected

### 4. Code Review

- [ ] Review all modified files:
  - [ ] `lib/ai/event-parser.ts`
  - [ ] `lib/utils/validators.ts`
  - [ ] `pages/api/events/parse.ts`
  - [ ] `pages/api/events/refine.ts`
- [ ] Verify backward compatibility maintained
- [ ] Check error handling is graceful
- [ ] Confirm TypeScript types are correct

### 5. Testing

- [ ] Run build locally: `npm run build`
- [ ] Test Free plan limits:
  - [ ] Create 2 events (should succeed)
  - [ ] Try creating 3rd event (should block)
  - [ ] Use 5 AI generations (should succeed)
  - [ ] Try 6th AI generation (should block)
- [ ] Test upgrade flow:
  - [ ] Click upgrade button
  - [ ] Complete Flowglad checkout
  - [ ] Verify plan updated
  - [ ] Test higher limits work
- [ ] Test platform fee calculation:
  - [ ] Verify Free plan: 5% fee
  - [ ] Verify Pro plan: 3% fee
- [ ] Test error scenarios:
  - [ ] Flowglad API down (should fall back to Free plan)
  - [ ] Invalid API key (should log error)
  - [ ] Network timeout (should handle gracefully)

---

## Deployment Steps

### 6. Deploy to Staging

- [ ] Push code to staging branch
- [ ] Deploy to staging environment
- [ ] Set staging environment variables
- [ ] Run database migration on staging
- [ ] Smoke test all features:
  - [ ] Event creation works
  - [ ] AI parsing works
  - [ ] Upgrade flow works
  - [ ] Billing APIs respond correctly

### 7. Production Deployment

- [ ] Create production deployment PR
- [ ] Get code review approval
- [ ] Merge to main branch
- [ ] Deploy to production
- [ ] Monitor deployment:
  - [ ] Check build logs for errors
  - [ ] Verify all routes deployed
  - [ ] Check server logs for issues

### 8. Post-Deployment Verification

- [ ] Test production endpoints:
  - [ ] `GET /api/billing/plan?userId=test`
  - [ ] `GET /api/billing/usage?userId=test`
  - [ ] `POST /api/events/parse` (with userId)
- [ ] Create test user in production
- [ ] Verify Free plan limits enforced
- [ ] Test upgrade checkout flow end-to-end
- [ ] Verify Flowglad webhook delivery (if configured)

---

## Monitoring & Alerts

### 9. Set Up Monitoring

- [ ] Add error tracking for Flowglad API calls
- [ ] Set up alerts for:
  - [ ] Flowglad API errors (> 5% error rate)
  - [ ] Failed checkout sessions
  - [ ] Database migration issues
  - [ ] Usage limit bypass (should never happen)
- [ ] Monitor key metrics:
  - [ ] API response times
  - [ ] Upgrade conversion rate
  - [ ] Plan distribution (Free vs Pro vs Enterprise)
  - [ ] Average AI usage per user

### 10. Documentation

- [ ] Update internal docs with Flowglad setup
- [ ] Document runbook for common issues
- [ ] Add Flowglad credentials to team password manager
- [ ] Create ops playbook for handling billing issues

---

## Rollback Plan

### If Issues Occur

**Minor Issues (API errors, slow responses):**
1. Monitor error rates
2. Check Flowglad status page
3. Review server logs
4. Contact Flowglad support if needed

**Major Issues (complete failure):**
1. Revert deployment to previous version
2. Restore database from backup (if migration issues)
3. Investigate root cause
4. Fix and redeploy

**Emergency Rollback Steps:**
```bash
# 1. Revert to previous deployment
git revert <commit-hash>
git push origin main

# 2. If database migration issues:
# Run rollback migration (create if needed)
# Restore from backup as last resort
```

---

## User Communication

### 11. Announce New Features

- [ ] Draft announcement email/blog post
- [ ] Highlight new subscription plans
- [ ] Explain benefits of upgrading
- [ ] Provide clear pricing information
- [ ] Include FAQs

**Key Messages:**
- ✅ Free plan still available
- ✅ More AI generations available with Pro
- ✅ Lower platform fees for paid plans
- ✅ Upgrade anytime with one click

### 12. Support Preparation

- [ ] Train support team on new billing system
- [ ] Create FAQ document
- [ ] Prepare canned responses for common questions:
  - "How do I upgrade my plan?"
  - "What happens when I hit my limit?"
  - "How do I cancel my subscription?"
  - "Can I downgrade to Free?"
- [ ] Set up support ticket routing for billing issues

---

## Post-Launch Tasks

### Week 1

- [ ] Monitor usage patterns daily
- [ ] Track upgrade conversion rate
- [ ] Review error logs for issues
- [ ] Collect user feedback
- [ ] Fix any bugs found

### Week 2-4

- [ ] Analyze plan distribution
- [ ] Calculate revenue impact
- [ ] A/B test upgrade prompts
- [ ] Optimize limit thresholds if needed
- [ ] Plan feature enhancements based on usage data

### Month 2+

- [ ] Review plan pricing
- [ ] Consider new plan tiers
- [ ] Add usage analytics dashboard
- [ ] Implement custom reporting
- [ ] Plan next iteration of features

---

## Success Criteria

Deployment is successful if:

✅ **Technical:**
- [ ] All APIs responding with < 500ms latency
- [ ] Error rate < 1%
- [ ] Zero database issues
- [ ] Flowglad sync working correctly

✅ **Business:**
- [ ] At least 10% of users upgrade within first month
- [ ] Platform fee revenue increases
- [ ] No significant user churn
- [ ] Positive user feedback

✅ **User Experience:**
- [ ] Upgrade flow completes in < 2 minutes
- [ ] Limits enforced accurately
- [ ] Error messages are clear and helpful
- [ ] No user complaints about billing

---

## Troubleshooting Reference

### Common Issues

**Issue:** Users can exceed limits
- **Check:** Is userId being passed to APIs?
- **Fix:** Ensure frontend sends userId in all API calls

**Issue:** Platform fees calculated incorrectly
- **Check:** Is Flowglad returning correct plan?
- **Fix:** Verify subscription status in Flowglad dashboard

**Issue:** Upgrade checkout fails
- **Check:** Are Flowglad credentials correct?
- **Fix:** Verify env vars in production environment

**Issue:** Database migration failed
- **Check:** Did existing data conflict?
- **Fix:** Review migration logs, fix data issues, retry

---

## Contact Information

**Flowglad Support:**
- Email: support@flowglad.com
- Docs: https://docs.flowglad.com
- Status: https://status.flowglad.com

**VibeTix Team:**
- Engineering Lead: [Your Name]
- DevOps: [Team Contact]
- Support: [Support Email]

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Production URL:** _____________
**Rollback Commit:** _____________

---

## Sign-Off

- [ ] Engineering Lead approved
- [ ] QA tested and approved
- [ ] DevOps reviewed deployment plan
- [ ] Product Manager approved go-live
- [ ] Support team ready

**Ready for Production:** ☐ Yes ☐ No

---

**Last Updated:** 2024-12-14
**Version:** 1.0.0
