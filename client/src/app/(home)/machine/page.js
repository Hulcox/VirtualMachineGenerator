"use client";
import DetailTable from "@/components/detailTable";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MachinePage = () => {
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();
  //check auth
  useEffect(() => {
    const token = localStorage.getItem("astrocloud-token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/${token}`).then(
        (response) => {
          if (response.ok) {
            setIsAuth(true);
            console.log("all is ok");
          } else if (response.status === 400) {
            localStorage.removeItem("astrocloud-token");
            router.push("/login");
            console.log("logout");
          }
        }
      );
    } else {
      console.log("logout");
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuth) {
    return null;
  }
  return (
    <div className="p-8">
      <div className="bg-base-100 p-8 rounded-2xl">
        <h1 className="text-xl font-bold">Gestion des Machines Virtuel</h1>
        <DetailTable />
      </div>
    </div>
  );
};

export default MachinePage;
