import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import * as accountServices from "@/app/services/accountServices";
import { User } from "@/app/globalInterfaces";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import FollowList from "./FollowList";

export type FollowRequest = {
  id: number;
  status?: string;
  targetEmail: string;
  requesterEmail: string;
};

export default function Follow() {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowRequestsOpen, setIsFollowRequestsOpen] = useState(false);
  const [isFollowerRequestsOpen, setIsFollowerRequestsOpen] = useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user) {
        setUser(await accountServices.getUser(session));
      }
      setIsLoading(false);
    };
    if (!user) {
      fetchData();
    }
  }, [session]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const searchUserToFollow = async () => {
    if (user && searchTerm) {
      try {
        const result = await accountServices.postFollow(session!, searchTerm.toLowerCase());
        if (result) {
          setUser((prevUser) => ({
            ...prevUser!,
            followRequests: [...prevUser!.followRequests, result],
          }));
          setSearchTerm("");
          toast.success("Follow request sent.");
        } else {
          toast.error("Could not follow user.");
        }
      } catch (error) {
        toast.error((error as Error).message);
      }
    }
  };

  const cancelFollowRequest = async (reqId: number) => {
    const result = await accountServices.deleteFollowRequest(session!, reqId);
    if (result) {
      setUser((prevUser) => ({
        ...prevUser!,
        followRequests: prevUser!.followRequests.filter((req: FollowRequest) => req.id !== reqId),
      }));
    } else {
      toast.error("Could not cancel request.");
    }
  };

  const declineFollowerRequest = async (reqId: number) => {
    const result = await accountServices.deleteFollowRequest(session!, reqId);
    if (result) {
      setUser((prevUser) => ({
        ...prevUser!,
        receivedFollowRequests: prevUser!.receivedFollowRequests.filter(
          (req: FollowRequest) => req.id !== reqId
        ),
      }));
    } else {
      toast.error("Could not decline request.");
    }
  };

  const acceptFollowRequest = async (req: FollowRequest) => {
    const result = await accountServices.postAcceptFollowRequest(session!, req.id);
    if (result) {
      setUser((prevUser) => ({
        ...prevUser!,
        receivedFollowRequests: prevUser!.receivedFollowRequests.filter(
          (r: FollowRequest) => r.id !== req.id
        ),
        followerEmails: [...prevUser!.followerEmails, req.requesterEmail],
      }));
    } else {
      toast.error("Could not accept request.");
    }
  };

  const unfollowUser = (email: string) => {
    if (user) {
      accountServices.deleteFollow(session!, email).then((result) => {
        if (result) {
          setUser((prevUser) => ({
            ...prevUser!,
            followingEmails: prevUser!.followingEmails.filter((e: string) => e !== email),
          }));
        } else {
          toast.error("Could not unfollow user.");
        }
      });
    }
  };

  const followBack = (email: string) => {
    if (user) {
      accountServices.postFollow(session!, email).then((result) => {
        if (result) {
          setUser((prevUser) => ({
            ...prevUser!,
            followRequests: [...prevUser!.followRequests, result],
          }));
        } else {
          toast.error("Could not follow back.");
        }
      });
    }
  };

  // Handle unauthenticated state
  if (!user && status !== "loading" && !session?.user?.email)
    return (
      <div className="w-full text-center z-900 px-1">
        <h1 className="text-4xl">Sign in to follow other users... ⚠️</h1>
      </div>
    );

  // Handle loading state
  return isLoading ? (
    <div className="mt-10">
      <FontAwesomeIcon
        icon={faCircleNotch}
        spin
        className="text-8xl text-black dark:text-slate-400"
      />
    </div>
  ) : (
    // Handle authenticated state
    <div>
      <div className="flex w-full mb-4 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search new users to follow"
          className="input input-bordered input-primary w-full rounded-r-none focus:outline-none"
        />
        <button onClick={searchUserToFollow} className="btn btn-primary rounded-l-none border-l-0">
          Follow
        </button>
      </div>

      <FollowList
        title="Follow Requests"
        isOpen={isFollowRequestsOpen}
        toggleOpen={() => setIsFollowRequestsOpen(!isFollowRequestsOpen)}
        requests={user?.followRequests || []}
        onCancel={cancelFollowRequest}
      />

      <FollowList
        title="Follower Requests"
        isOpen={isFollowerRequestsOpen}
        toggleOpen={() => setIsFollowerRequestsOpen(!isFollowerRequestsOpen)}
        requests={user?.receivedFollowRequests || []}
        onAccept={acceptFollowRequest}
        onDecline={declineFollowerRequest}
      />

      <FollowList
        title="Following"
        isOpen={isFollowingOpen}
        toggleOpen={() => setIsFollowingOpen(!isFollowingOpen)}
        emails={user?.followingEmails || []}
        onUnfollow={unfollowUser}
      />

      <FollowList
        title="Followers"
        isOpen={isFollowersOpen}
        toggleOpen={() => setIsFollowersOpen(!isFollowersOpen)}
        emails={user?.followerEmails || []}
        followingEmails={user?.followingEmails || []}
        followRequests={user?.followRequests || []}
        isFollowersList={true}
        onFollowBack={followBack}
      />
    </div>
  );
}
