import { 
    getActiveLeaseByTenant, 
    getLeaseHistoryByTenant, 
    getWorkOrdersByTenant 
} from '../../models/dashboard/dashboard.js';

/**
 * Renders the primary lease dashboard for the logged-in tenant.
 * Displays current lease terms, maintenance requests, history, and profile.
 */
const dashboardPage = async (req, res, next) => {
    try {
        // 1. Get the user from the session
        const user = req.session.user;

        // Safety check: If no user in session, redirect
        if (!user) {
            return res.redirect('/login'); 
        }

        const tenantId = user.id; 

        // 2. Fetch the active lease, history, and work orders in parallel
        const [activeLease, leaseHistory, workOrders] = await Promise.all([
            getActiveLeaseByTenant(tenantId),
            getLeaseHistoryByTenant(tenantId),
            getWorkOrdersByTenant(tenantId)
        ]);

        // 3. Prepare common render options
        const renderData = {
            title: activeLease ? `Lease - ${activeLease.property.name}` : 'My Lease',
            stylesheet: 'lease.css',
            user: user, 
            activeLease: activeLease || null,
            leaseHistory: leaseHistory || [],
            workOrders: workOrders || []
        };

        // 4. Render the page
        res.render('forms/login/dashboard', renderData);

    } catch (err) {
        console.error('Error fetching lease page:', err);
        err.status = 500;
        next(err);
    }
};

export { dashboardPage };