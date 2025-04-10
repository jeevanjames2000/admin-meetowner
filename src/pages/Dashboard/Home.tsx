import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";

import PageMeta from "../../components/common/PageMeta";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";



export default function Home() {
  
  const {  user } = useSelector((state: RootState) => state.auth);
  

  return (
    <>
      <PageMeta
        title="Meet Owner "
        description="Meet Owner Dashboard"
      />
      <div className="gap-4 md:gap-6 space-y-6">
        <EcommerceMetrics />
      </div>
     
      

    </>
  );
}