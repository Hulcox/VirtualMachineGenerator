"use client";
import Link from "next/link";
import { FiLogOut } from "react-icons/fi";

const LogOut = () => {
  const logout = () => {
    localStorage.removeItem("astrocloud-token");
  };

  return (
    <Link
      className=" btn btn-ghost text-error text-xl"
      href="/login"
      onClick={logout}
    >
      <FiLogOut />
    </Link>
  );
};

export default LogOut;
