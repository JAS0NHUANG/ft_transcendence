import React from "react";
import CheckBox2FA from "./CheckBox2FA";
import EditUsername from "./EditUsername";

const EditInfosForm: React.FC = () => {

	return (
		<form className="settings_form">
			<CheckBox2FA />
			<EditUsername />
			<div>
				<input type ="text" id="old_password" placeholder="old password"/>
				<input type ="text" id="new_password" placeholder="new password"/>
				<button className="basic_btn">Confirm</button>
			</div>
		</form>
	);
};

export default EditInfosForm;