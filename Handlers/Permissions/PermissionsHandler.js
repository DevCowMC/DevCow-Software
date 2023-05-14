const json = require(handlersDir + "Storage/File/JSONHandler");
const DatabaseHandler = require(handlersDir + "Storage/Database/DatabaseHandler");
const UserService = require(serviceDir + "UserService");
const httpStatus = require("http-status");
const fs = require("fs");

class PermissionsHandler
{
	constructor()
	{
		let permissionsTemplateFile = fs.readFileSync(handlersDir + 'Storage/Database/Data/Permissions.json', "utf8");
		this.permissionsTemplate = JSON.parse(permissionsTemplateFile)
	}

	async Init()
	{
		let BlankPermissionsModel = DatabaseHandler.GetInstance().GetModel("permissionnodes");
		let BlankUserPermissionsModel = DatabaseHandler.GetInstance().GetModel("userpermissions");

		let AllPermissionNodes = await BlankPermissionsModel.findAll();

		for(let i = 0; i < this.permissionsTemplate.length; i++)
		{
			let role = this.permissionsTemplate[i];
			let roleName = role.RoleName;

			for(let j = 0; j < role.Permissions.length; j++)
			{
				let permissionNode = role.Permissions[j];

				let found = false;

				AllPermissionNodes.forEach((perm) =>
				{
					if(perm.Node == permissionNode)
					{
						found = true;
						return;
					}
				});

				if(!found)
				{
					await BlankPermissionsModel.create({Role: roleName, Node: permissionNode});
				}
			}
		}

		this.AllPermissionNodes = await BlankPermissionsModel.findAll();
		this.UserPermissionNodes = await BlankUserPermissionsModel.findAll();
	}

	GetUsersPermissions(UserID)
	{
		let permissions = [];

		if(this.UserPermissionNodes < 1) return [];

		this.UserPermissionNodes.forEach((perm) =>
		{
			if(perm.UserID == UserID)
			{
				permissions.push(perm.Node);
			}
		});

		return permissions;
	}

	GetRolePermissions(role)
	{
		let permissions = [];

		this.AllPermissionNodes.forEach((perm) =>
		{
			if(perm.Role == role)
			{
				permissions.push(perm.Node);
			}
		});

		return permissions;
	}

	async HasPermission(User, UserID, PermissionNode)
	{
		let UserRole = undefined;
		let UserPerms = undefined;

		if(User != undefined)
		{
			UserRole = User.Role;
			UserID = User.UserID
		}

		if(UserID != undefined)
		{
			const user = await UserService.GetUserByUserId(UserID);

			if(!user) return {Success: false, Message: "User Not Found", Status: httpStatus.UNAUTHORIZED}

			UserRole = user.Role;

			UserPerms = this.GetUsersPermissions(UserID);
		}
		else
		{
			return {Success: false, Message: "UserID Is Missing", Status: httpStatus.UNAUTHORIZED}
		}


		if(UserRole != undefined)
		{
			let hasPermission = false;

			let RolePermissions = this.GetRolePermissions(UserRole);

			let completePermissionNode = PermissionNode;
			let splitPermissionNode = completePermissionNode.split(".");
			let categoryWildcard = "*";
			let subCategoryWildcard = splitPermissionNode[0] + ".*";
			let actionWildcard = splitPermissionNode[0] + "." + splitPermissionNode[1] + ".*";

			if(RolePermissions.includes(completePermissionNode)) hasPermission = true;
			if(RolePermissions.includes(actionWildcard)) hasPermission = true;
			if(RolePermissions.includes(subCategoryWildcard)) hasPermission = true;
			if(RolePermissions.includes(categoryWildcard)) hasPermission = true;

			if(UserPerms.includes(completePermissionNode)) hasPermission = true;
			if(UserPerms.includes(actionWildcard)) hasPermission = true;
			if(UserPerms.includes(subCategoryWildcard)) hasPermission = true;
			if(UserPerms.includes(categoryWildcard)) hasPermission = true;


			if(RolePermissions.includes("-" + completePermissionNode)) hasPermission = false;
			if(RolePermissions.includes("-" + actionWildcard)) hasPermission = false;
			if(RolePermissions.includes("-" + subCategoryWildcard)) hasPermission = false;
			if(RolePermissions.includes("-" + categoryWildcard)) hasPermission = false;


			if(UserPerms.includes("-" + completePermissionNode)) hasPermission = false;
			if(UserPerms.includes("-" + actionWildcard)) hasPermission = false;
			if(UserPerms.includes("-" + subCategoryWildcard)) hasPermission = false;
			if(UserPerms.includes("-" + categoryWildcard)) hasPermission = false;

			if(hasPermission) return {Success: true, Message: "", Status: httpStatus.OK}

			return {Success: false, Message: "Permission Denied", Status: httpStatus.UNAUTHORIZED}
		}

		return {Success: false, Message: "User Not Found", Status: httpStatus.UNAUTHORIZED}
	}

	GetAllPermissions()
	{
		return this.AllPermissionNodes;
	}

	GetAllUserPermissions()
	{
		return this.UserPermissionNodes;
	}

	static GetInstance()
	{
		if (!this.instance)
		{
			this.instance = new PermissionsHandler();
		}

		return this.instance;
	}
}

module.exports = PermissionsHandler;