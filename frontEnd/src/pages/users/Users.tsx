import UsersList from "../../components/users/UsersList";
import PageMeta from "../../components/common/PageMeta";
export default function Users() {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard |  - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page- React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="col-span-12">
          <UsersList />
              </div>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        
        
      </div>
    </>
  );
}
