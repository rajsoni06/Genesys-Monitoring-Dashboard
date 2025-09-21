import React from "react";
import { User } from "lucide-react";
import "./Profile.css";

const Profile: React.FC<{ currentUser: { name: string; email: string } }> = ({
  currentUser,
}) => {
  const username = currentUser.name
    ? currentUser.name.toLowerCase().replace(" ", ".")
    : "N/A";
  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <User />
          </div>
          <h2 className="profile-name">{currentUser.name || "User Name"}</h2>
          <p className="profile-email">{currentUser.email}</p>
        </div>
        <div className="profile-details">
          <h3 className="section-title">User Details</h3>
          <div className="detail-item">
            <span className="detail-label">Username:</span>
            <span className="detail-value">{username}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Location:</span>
            <span className="detail-value">India</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Member Since:</span>
            <span className="detail-value">September 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
