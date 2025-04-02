import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";

import PageMeta from "../../components/common/PageMeta";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";



export default function Home() {
  
  const {  user } = useSelector((state: RootState) => state.auth);
  

  return (
    <>
      <PageMeta
        title="MeetOwner Admin"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="gap-4 md:gap-6 space-y-6">
        <EcommerceMetrics />
      </div>
      <div>
        <p>{user?.name}</p>
      </div>
      

    </>
  );
}