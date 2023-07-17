"use client";
import Link from "next/link";
import { MdComputer } from "react-icons/md";
import { AiFillHome, AiOutlineCloudServer } from "react-icons/ai";
import { usePathname } from "next/navigation";

const MenuDrawer = () => {
  const pathname = usePathname();

  console.log(pathname);

  return (
    <ul className="menu p-4 w-80 h-full bg-base-200 text-base-content">
      <li>
        <Link
          className={`text-lg font-bold ${pathname == "/" ? "active" : null}`}
          href={"/"}
        >
          <AiFillHome />
          Menu
        </Link>
      </li>
      <li className="mt-8">
        <h2 className="menu-title text-lg">Machine virtuel</h2>
        <ul>
          <li>
            <Link
              className={`text-md font-bold ${
                pathname == "/create" ? "active" : null
              }`}
              href={"/create"}
            >
              <MdComputer />
              Crée une machine virtuel
            </Link>
          </li>
          <li>
            <Link
              className={`text-md font-bold ${
                pathname == "/machine" ? "active" : null
              }`}
              href={"/machine"}
            >
              <AiOutlineCloudServer />
              Liste des machines
            </Link>
          </li>
        </ul>
      </li>
    </ul>
  );
};

export default MenuDrawer;
