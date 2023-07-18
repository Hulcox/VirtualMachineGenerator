"use client";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
const CreatePage = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedVm, setSelectedVm] = useState(null);
  const [result, setResult] = useState(null);
  const router = useRouter();
  //check if user are auth else redirect to login page
  useEffect(() => {
    const token = localStorage.getItem("astrocloud-token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/${token}`).then(
        (response) => {
          if (response.ok) {
            setIsAuth(true);
            setUser(JSON.parse(localStorage.getItem("astrocloud-user")));
          } else if (response.status === 400) {
            localStorage.removeItem("astrocloud-token");
            router.push("/login");
          }
        }
      );
    } else {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // use fetch to do request for starting vm, request is a promise to now when the vm are realy started and to show information after
  const formik = useFormik({
    initialValues: {
      vm: "",
    },
    onSubmit: (values, { setSubmitting }) => {
      let data = null;
      setSelectedVm(null);
      setResult(null);
      // use switch methode to get the correct information for the request
      switch (values.vm) {
        case "ubuntu":
          setSelectedVm("Ubuntu");
          data = {
            publisher: "Canonical",
            offer: "UbuntuServer",
            sku: "18.04-LTS",
            userId: user.id,
          };

          break;

        case "centos":
          setSelectedVm("CentOs");
          data = {
            publisher: "OpenLogic",
            offer: "CentOS",
            sku: "7.5",
            userId: user.id,
          };

          break;

        case "debian":
          setSelectedVm("Debian");
          data = {
            publisher: "Debian",
            offer: "debian-10",
            sku: "10",
            userId: user.id,
          };
          break;

        case "win10":
          setSelectedVm("Windows 10");
          data = {
            publisher: "MicrosoftWindowsDesktop",
            offer: "Windows-10",
            sku: "20h2-pro",
            userId: user.id,
          };

          break;

        default:
          break;
      }

      if (data) {
        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/createVm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((response) => {
            if (response.ok) {
              setSubmitting(false);
              return response.json();
            } else {
              response.text().then((errorMessage) => {
                setSubmitting(false);
              });
            }
          })
          .then((data) => {
            if (data) {
              setResult(data);
              setLoading(false);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        setSubmitting(false);
      }
    },
  });

  const options = [
    {
      value: "ubuntu",
      label: "Ubuntu",
    },
    {
      value: "centos",
      label: "CentOS",
    },
    {
      value: "debian",
      label: "Debian",
    },
    {
      value: "win10",
      label: "Windows 10",
    },
  ];

  if (!isAuth) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="bg-base-100 p-8 rounded-2xl">
        <h1 className="text-xl font-bold">Creation des Machines Virtuel</h1>
        {user.credit == 0 ? (
          <div className="text-error m-4">
            {
              "Vous pouvez pas crée de Machine Virtuel vous n'avez pas asser de crédit"
            }
          </div>
        ) : (
          <div className="m-4">
            {user.credit <= 20 && (
              <div className="text-warning">
                {"Attention vous êtes limité a un seul type de machine virtuel"}
              </div>
            )}
            <div>
              <form
                onSubmit={formik.handleSubmit}
                className="w-fullml-8 mt-8 flex justify-between"
              >
                <div className="flex flex-col gap-4">
                  <label htmlFor="vm" className="text-lg">
                    Machine Virtuel
                  </label>
                  <select
                    className="select select-primary w-full max-w-xs"
                    id="vm"
                    name="vm"
                    onChange={formik.handleChange}
                  >
                    <option disabled selected>
                      Liste des vm
                    </option>
                    {options
                      .slice(
                        user.credit <= 20 ? 2 : 0,
                        user.credit <= 20 ? 3 : options.length
                      )
                      .map(({ value, label }, key) => (
                        <option key={key} value={value}>
                          {label}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary self-end"
                  disabled={loading}
                >
                  {formik.isSubmitting ? (
                    <span className="loading loading-spinner"></span>
                  ) : null}
                  Créer
                </button>
              </form>
              <div className="mockup-code mt-4">
                <pre data-prefix="$">
                  <code>Status de création machine virtuel : </code>
                </pre>
                {selectedVm && (
                  <pre data-prefix="$">
                    <code>{"Création d'une machine " + selectedVm} : </code>
                  </pre>
                )}
                {loading && (
                  <pre
                    data-prefix=">"
                    className="text-warning flex items-center"
                  >
                    <code className="flex items-center gap-2">
                      en cours de création
                      <span className="loading loading-dots loading-md"></span>
                    </code>
                  </pre>
                )}
                {result && (
                  <>
                    <pre data-prefix=">" className="text-info">
                      <code>Fini!</code>
                    </pre>
                    <pre data-prefix=">" className="text-success">
                      <code>Addresse ip : {result.ip}</code>
                    </pre>
                    <pre data-prefix=">" className="text-success">
                      <code>Utilisateur : {result.user}</code>
                    </pre>
                    <pre data-prefix=">" className="text-success">
                      <code>Mot de passe : {result.password}</code>
                    </pre>
                    <pre data-prefix=">" className="text-success">
                      <code>
                        {"Type d'OS"} : {result.os}
                      </code>
                    </pre>
                    <pre data-prefix=">" className="text-info">
                      <code>
                        {"Connecter vous avec la commande"} :{" "}
                        {`ssh ${result.user}@${result.ip}`}
                      </code>
                    </pre>
                    <pre data-prefix=">" className="text-error">
                      <code>
                        Attention la machine se détruira à :{" "}
                        {DateTime.fromISO(result.deletingAt)
                          .setLocale("fr")
                          .toLocaleString(DateTime.DATETIME_SHORT)}
                      </code>
                    </pre>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePage;
