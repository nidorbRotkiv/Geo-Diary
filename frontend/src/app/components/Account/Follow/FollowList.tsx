import React from "react";
import { FollowRequest } from "./Follow";

type FollowListProps = {
  title: string;
  isOpen: boolean;
  toggleOpen: () => void;
  requests?: FollowRequest[];
  followRequests?: FollowRequest[];
  followingEmails?: string[];
  isFollowersList?: boolean;
  onCancel?: (reqId: number) => void;
  onAccept?: (req: FollowRequest) => void;
  onDecline?: (reqId: number) => void;
  emails?: string[];
  onUnfollow?: (email: string) => void;
  onFollowBack?: (email: string) => void;
};

const FollowList: React.FC<FollowListProps> = ({
  title,
  isOpen,
  toggleOpen,
  requests = [],
  followRequests = [],
  followingEmails = [],
  isFollowersList = false,
  onCancel,
  onAccept,
  onDecline,
  emails = [],
  onUnfollow,
  onFollowBack,
}) => {
  const userRowClasses =
    "flex justify-between items-center rounded-lg p-2 dark:bg-slate-600 dark:bg-opacity-50";

  const shouldShowFollowBack = (email: string) => {
    return (
      !followingEmails.includes(email) && !followRequests.some((req) => req.targetEmail === email)
    );
  };

  return (
    <div className="mb-2">
      <h2 className="text-xl font-semibold cursor-pointer select-none" onClick={toggleOpen}>
        {title} ({requests.length || emails.length}) {isOpen ? "▲" : "▼"}
      </h2>
      {isOpen && (
        <ul>
          {requests.map((req: FollowRequest) => (
            <li key={req.id} className={userRowClasses}>
              <span>{req.targetEmail || req.requesterEmail}</span>
              <div className="flex space-x-2">
                {onCancel && (
                  <button onClick={() => onCancel(req.id)} className="btn btn-error btn-xs">
                    Cancel
                  </button>
                )}
                {onAccept && (
                  <button onClick={() => onAccept(req)} className="btn btn-success btn-xs">
                    Accept
                  </button>
                )}
                {onDecline && (
                  <button onClick={() => onDecline(req.id)} className="btn btn-error btn-xs">
                    Decline
                  </button>
                )}
              </div>
            </li>
          ))}
          {emails.map((email: string) => (
            <li key={email} className={userRowClasses}>
              <span>{email}</span>
              <div className="flex space-x-2">
                {onUnfollow && (
                  <button onClick={() => onUnfollow(email)} className="btn btn-error btn-xs">
                    Unfollow
                  </button>
                )}
                {onFollowBack && shouldShowFollowBack(email) && (
                  <button onClick={() => onFollowBack(email)} className="btn btn-success btn-xs">
                    Follow Back
                  </button>
                )}
                {isFollowersList && (
                  <button onClick={() => {}} className="btn btn-error btn-xs">
                    Remove (not implemented yet)
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FollowList;
