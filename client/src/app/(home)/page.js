"use client";
import { MdComputer } from "react-icons/md";
import { AiOutlineCloudServer } from "react-icons/ai";
import { BsCoin } from "react-icons/bs";
import Link from "next/link";
import DetailTable from "@/components/detailTable";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";

export default function Home() {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [vm, setVm] = useState([]);

  const router = useRouter();
  //check auth
  useEffect(() => {
    const token = localStorage.getItem("astrocloud-token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/${token}`).then(
        (response) => {
          if (response.ok) {
            setIsAuth(true);
            setUser(JSON.parse(localStorage.getItem("astrocloud-user")));
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("astrocloud-user"));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/allMachine/${user.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          response.text().then((errorMessage) => {
            setVm([]);
          });
        }
      })
      .then((data) => {
        if (data) {
          setVm(data);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuth) {
    return null;
  }

  return (
    <main>
      <div className="p-8">
        <div className="flex justify-between">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary self-center">
                <MdComputer className="text-2xl mt-1" />
              </div>
              <div className="stat-title">{"Machine Virtuel"}</div>
              <div className="stat-value text-primary">
                {
                  vm.filter((elm) =>
                    Math.round(
                      DateTime.fromSQL(elm.created_at).diff(DateTime.now(), [
                        "minutes",
                      ]).minutes > 0
                    )
                  ).length
                }
              </div>
              <div className="stat-desc">{"en cours d'execution"}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-secondary self-center">
                <AiOutlineCloudServer className="text-2xl mt-1" />
              </div>
              <div className="stat-title">{"Machine Virtuel"}</div>
              <div className="stat-value text-secondary">{vm.length}</div>
              <div className="stat-desc">{"nombre total crée"}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-accent self-center">
                <BsCoin className="text-2xl mt-4" />
              </div>
              <div className="stat-title">{"Crédit restant"}</div>
              <div className="stat-value text-accent">{user.credit}</div>
            </div>
          </div>
        </div>
        <div className="bg-base-100 mt-12 p-8 rounded-2xl">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Gestion des Machines Virtuel</h1>
            <Link href="/create" className="btn btn-sm btn-primary">
              Crée une machine
            </Link>
          </div>
          <DetailTable litle />
        </div>
      </div>
      {user.credit == 0 && (
        <div className="toast toast-end">
          <div className="alert alert-error">
            <span>{"Attention vous n'avez plus de crédit"}</span>
          </div>
        </div>
      )}
    </main>
  );
}
