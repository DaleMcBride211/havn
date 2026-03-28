import { getActiveLeaseByTenant, getLeaseHistoryByTenant } from '../../models/leaseunit/lease.js';

/**
 * Renders the primary lease dashboard for the logged-in tenant.
 * Displays current lease terms, unit details, property info, and user profile.
 */
const tenantLeasePage = async (req, res, next) => {
    try {
        // 1. Get the user from the session
        const user = req.session.user;

        console.log(user);

        // Safety check: If no user in session, redirect or error out
        if (!user) {
            return res.redirect('/login'); 
        }

        const tenantId = user.id; 

        // 2. Fetch the active lease and history
        const [activeLease, leaseHistory] = await Promise.all([
            getActiveLeaseByTenant(tenantId),
            getLeaseHistoryByTenant(tenantId)
        ]);

        // 3. Prepare common render options
        const renderData = {
            title: activeLease ? `Lease - ${activeLease.property.name}` : 'My Lease',
            stylesheet: 'lease.css',
            user: user, // Passing the full user object to the view
            activeLease: activeLease || null,
            leaseHistory: leaseHistory || []
        };

        // 4. Render the page
        res.render('leaseunit/lease', renderData);

    } catch (err) {
        console.error('Error fetching lease page:', err);
        err.status = 500;
        next(err);
    }
};

export { tenantLeasePage };