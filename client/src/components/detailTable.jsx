"use client";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

const DetailTable = ({ litle }) => {
  const [vm, setVm] = useState([]);

  // get all machine by user to show information in tab
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

  return (
    <div className="mt-8">
      <h2 className="text-md font-bold">Détails des machines :</h2>
      <table className="table mt-2">
        <thead>
          <tr>
            <th>Id</th>
            <th className="text-center">Ip de la machine</th>

            {litle ? null : (
              <>
                <th>Crée à</th>
                <th>temps restant</th>
              </>
            )}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {vm?.map((elm, key) => (
            <tr key={key}>
              <td>{elm.id}</td>
              <td className="text-center">
                {elm.name} {`Connexion ssh : AstroCloudAdmin@${elm.name}`}
              </td>
              {litle ? null : (
                <>
                  <th>
                    {DateTime.fromSQL(elm.created_at)
                      .setLocale("fr")
                      .toLocaleString(DateTime.DATETIME_SHORT)}
                  </th>
                  <th>
                    {DateTime.fromSQL(elm.created_at).diff(DateTime.now(), [
                      "minutes",
                    ]).minutes <= 0
                      ? "0 minutes"
                      : Math.round(
                          DateTime.fromSQL(elm.created_at).diff(
                            DateTime.now(),
                            ["minutes"]
                          ).minutes
                        ) + " minutes"}
                  </th>
                </>
              )}
              <td>
                <div
                  className={`badge ${
                    DateTime.fromSQL(elm.created_at).diff(DateTime.now(), [
                      "minutes",
                    ]).minutes > 0
                      ? "badge-info"
                      : "badge-error"
                  }`}
                >
                  {DateTime.fromSQL(elm.created_at).diff(DateTime.now(), [
                    "minutes",
                  ]).minutes > 0
                    ? "En cours d'execution"
                    : "supprimé"}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetailTable;
