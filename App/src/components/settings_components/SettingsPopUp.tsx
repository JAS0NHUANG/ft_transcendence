import React, { useState } from "react";
import WhitePopUp from "./styles/WhitePopUp";
import EditAvatar from "./EditAvatar";
import CheckBox2FA from "./CheckBox2FA";
import EditUsername from "./EditUsername";
import EditPassword from "./EditPassword";

const SettingsPopUp: React.FC = () => {
	const [updateError, setUpdateError] = useState("");
	const [updateSuccess, setUpdateSuccess] = useState("");

  // Function to handle errors and update updateError state
  const handleUpdateError = (error: string) => {
    setUpdateError(error);
  };
	// Function to handle success and update updateSuccess state
  const handleUpdateSuccess = (success: string) => {
    setUpdateSuccess(success);
  };

	return (
		<WhitePopUp>
			<h2>Settings</h2>
			<h3>Manage your informations and security</h3>
			<EditAvatar />
			<CheckBox2FA />
			<EditUsername onError={handleUpdateError} />
			<EditPassword onError={handleUpdateError} onSuccess={handleUpdateSuccess}/>
			{updateSuccess && <div style={{ color: 'green', fontSize: '12px' }}>{updateSuccess}</div>}
			{updateError && <div style={{ color: 'red', fontSize: '12px' }}>{updateError}</div>}
		</WhitePopUp>
	);
};

export default SettingsPopUp;