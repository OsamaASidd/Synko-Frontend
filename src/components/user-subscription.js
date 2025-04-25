import { GlobalContext } from "@/context";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import FullPageLoader from "./ui/full-page-loader";
import { getRequest } from "@/utils/apiFunctions";

const UserSubscription = ({ children }) => {
  const router = useRouter();
  const { user, merchant } = useContext(GlobalContext);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const [data, setData] = useState(null);
  const getData = () => {
    getRequest(`/verify-my-subscription`)
      .then((res) => {
        const responseData = res?.data;
        if (responseData?.isUserDowngraded == true) {
          setData(responseData?.data);
        } else {
          setData(null);
        }
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  };

  useEffect(() => {
    if (user) {
      getData();
    }
  }, [user, merchant]);

  useEffect(() => {
    if (data) {
      Swal.fire({
        icon: "warning",
        title: "Subscription Alert",
        showDenyButton: true,
        text: `Your free trial period for Synko POS has officially ended. To
          continue accessing all the powerful features, upgrade your plan
          today and unlock the full potential of Synko POS.`,
        confirmButtonText: "Subscribe Now",
        denyButtonText: "Skip for Now",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/manage/subscription");
        }
      });
    }
  }, [data]);

  if (isPageLoading == true || isPageLoading === "undefined") {
    return <FullPageLoader />;
  }

  return <>{children}</>;
};

export default UserSubscription;
