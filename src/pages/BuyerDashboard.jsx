import BuyerMap from '../components/BuyerMap';
import DashboardLayout from '../components/DashboardLayout';

const BuyerDashboard = () => {
    return (
        <DashboardLayout>
            <div className="animate-fadeIn">
                <BuyerMap />
            </div>
        </DashboardLayout>
    );
};

export default BuyerDashboard;
