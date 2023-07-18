"use client";
import { useFormik } from "formik";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BiHide, BiShow } from "react-icons/bi";
import * as Yup from "yup";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const router = useRouter();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Email invalide").required("Email requis"),
    password: Yup.string().required("Mot de passe requis"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: (values, { setSubmitting }) => {
      // use fetch for http request
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
        .then((response) => {
          if (response.ok) {
            setSubmitting(false);
            return response.json();
          } else {
            response.text().then((errorMessage) => {
              setErrorMessage(errorMessage);
              setSubmitting(false);
            });
          }
        })
        .then((data) => {
          if (data) {
            //store information like token and user
            localStorage.setItem("astrocloud-token", data.token);
            localStorage.setItem("astrocloud-user", JSON.stringify(data.user));
            router.push("/");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
  });

  // form login to connect into dashboard
  return (
    <main className="min-h-screen  bg-base-100">
      <Image
        src={"/images/background.png"}
        alt="fond page de login"
        fill
        className="object-cover z-0"
      />
      <div className="absolute top-1/2 left-10 transform -translate-y-1/2 bg-base-200 shadow-sm shadow-black rounded-lg w-1/3 p-8">
        <h1 className="text-center mt-4 text-3xl font-bold">Connexion</h1>
        <form onSubmit={formik.handleSubmit} className="w-2/3 ml-8 mt-8">
          <div className="flex flex-col gap-4">
            <label htmlFor="email" className="text-lg">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Entrez votre email ici ..."
              className="input input-bordered input-primary w-full"
              onChange={formik.handleChange}
              value={formik.values.email}
            />
            {formik.errors.email ? (
              <div className="bg-error p-2 rounded-lg w-full text-white">
                {formik.errors.email}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-4 mt-8">
            <label htmlFor="password" className="text-lg">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Entrez votre mot de passe ici ..."
                className="input input-bordered input-primary w-full"
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              <div className="cursor-pointer absolute top-3 right-2 ">
                <label className="swap swap-rotate">
                  <input type="checkbox" onClick={handleShowPassword} />
                  <BiShow className="swap-on text-2xl" />
                  <BiHide className="swap-off text-2xl" />
                </label>
              </div>
            </div>
            {formik.errors.password ? (
              <div className="bg-error p-2 rounded-lg w-full">
                {formik.errors.password}
              </div>
            ) : null}
          </div>
          {errorMessage ? (
            <div className="bg-error p-2 rounded-lg w-full mt-10">
              {errorMessage}
            </div>
          ) : null}
          <button type="submit" className="btn btn-primary mt-12">
            {formik.isSubmitting ? (
              <span className="loading loading-spinner"></span>
            ) : null}
            Connexion
          </button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
