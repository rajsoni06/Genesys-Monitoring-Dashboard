import { Dashboard } from '@/components/Dashboard';

const Index = ({ handleLogout, currentUser }: { handleLogout: () => void, currentUser: { name: string, email: string } }) => {
  return <Dashboard handleLogout={handleLogout} currentUser={currentUser} />;
};

export default Index;
