import { deleteUser } from "@/app/services/accountServices";
import { useSwal } from "@/app/contexts/SwalContext";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function DangerZone() {
  const { data: session, status } = useSession();
  const { customSwal } = useSwal();
  const router = useRouter();

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="mt-10 flex justify-center items-center">
        <FontAwesomeIcon
          icon={faCircleNotch}
          spin
          className="text-8xl text-black dark:text-slate-400"
        />
      </div>
    );
  }

  // Handle unauthenticated state
  if (!session) {
    return (
      <div className="w-full text-center z-900 px-1">
        <h1 className="text-4xl">Sign in to access the danger zone... ⚠️</h1>
      </div>
    );
  }

  // Function to handle account deletion
  const handleDeleteAccount = async () => {
    customSwal
      .fire({
        title: "Are you sure you want to delete your account?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            const success = await deleteUser(session);
            if (success) {
              toast.success("Account deleted successfully");
              await signOut({ redirect: false });
              router.push("/");
            } else {
              toast.error("Failed to delete account");
            }
          } catch (error) {
            toast.error("An error occurred while deleting the account");
          }
        }
      });
  };

  // Handle authenticated state
  return (
    <div className="flex justify-center items-center">
      <button
        onClick={handleDeleteAccount}
        className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-xl"
      >
        Delete account
      </button>
    </div>
  );
}
