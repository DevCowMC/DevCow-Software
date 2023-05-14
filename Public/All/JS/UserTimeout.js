/*! jQuery userTimeout - v0.2.0 - 2016-02-24
* https://github.com/lleblanc42/jquery-userTimeout
* Copyright (c) 2016 Luke LeBlanc; Licensed GPL-3.0 */

$(() =>
{
	let options =
		{
			logouturl: "/auth/logout",                   // ULR to redirect to, to log user out
			refreshurl: "/auth/refreshtoken", 				   // Toggle for enabling the countdown timer
			pageTimout: 10,                   // Seconds
			modalTimeout: 30,   			   // Shows alerts
			modalTitle: 'Session Timeout',     // Modal Title
			modalBody: 'You\'re being timed out due to inactivity.\nPlease choose to stay signed in or to logoff.\nOtherwise, you will logged off automatically.'  // Modal Body
		};

	let modalTimer = false;
	
	let logoutBtnCode = '<button type="button" class="btn btn-lg btn-success" id="LogoutBtn">Logout</button>';
	let stayLoggedInBtnCode = '<button type="button" class="btn btn-lg btn-danger" id="StayLoggedInBtn">Stay Logged In</button>';

	let modal = '<div class="modal fade" id="userTimoutModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">\n' +
		'    <div class="modal-dialog modal-dialog-centered modal-lg">\n' +
		'        <div class="modal-content">\n' +
		'            <div class="modal-header">\n' +
		'                <h1 class="modal-title fs-5" id="staticBackdropLabel">' + options.modalTitle + '</h1>\n' +
		'            </div>\n' +
		'            <div class="modal-body">' + options.modalBody + '</div>\n' +
		'            <div class="modal-footer">\n' +
		'                <div class="container-fluid">\n' +
		'                    <div class="row text-center">\n' +
		'                        <div class="col-6">\n';
	let modalEnd = '                        </div>\n' +
	'                    </div>\n' +
	'                </div>\n' +
	'            </div>\n' +
	'        </div>\n' +
	'    </div>\n' +
	'</div>';
		modal = modal.concat(" ", stayLoggedInBtnCode)
		modal = modal.concat(" ", '</div><div class="col-6">');
		modal = modal.concat(" ", logoutBtnCode);
		modal = modal.concat(" ", modalEnd);



	let body = document.body;
	body.innerHTML += modal;

	let timeElapsed = 0;
	let logoutBtn, stayLoggedInBtn;
	let modalBox;

	let timer = setInterval(() =>
	{
		timeElapsed += 1;
		console.log(timeElapsed);
		CheckTime();

	}, 1000);

	document.addEventListener("click", ResetTimer);
	document.addEventListener("mousemove", ResetTimer);
	document.addEventListener("keypress", ResetTimer);
	document.addEventListener("wheel", ResetTimer);


	function CheckTime()
	{
		if (modalTimer)
		{
			if (timeElapsed >= options.modalTimeout)
			{
				Logout();
			}
			else
			{
				stayLoggedInBtn.textContent = "Stay Logged In (" + (options.modalTimeout - timeElapsed) + ")"
			}
		}
		else
		{
			if (timeElapsed >= options.pageTimout)
			{
				ShowModal();
				ResetTimer();
				modalTimer = true;
			}

		}
	}

	function ResetTimer()
	{
		if(modalTimer === false) timeElapsed = 0;
	}

	function ShowModal()
	{
		modalBox = new bootstrap.Modal('#userTimoutModal', {});
		modalBox.show();

		logoutBtn = document.getElementById("LogoutBtn");
		stayLoggedInBtn = document.getElementById("StayLoggedInBtn");

		logoutBtn.addEventListener("click", Logout);
		stayLoggedInBtn.addEventListener("click", StayLoggedIn);
	}

	function Logout()
	{
            clearInterval(timer);
			window.location.replace(options.logouturl);
	}

	function StayLoggedIn()
	{
		$.ajax({
			url: options.refreshurl,
			type: "GET",
			success: function(data)
			{
				if(data.Success == true)
				{
					modalBox.hide();
					modalTimer = false;
					ResetTimer();
					stayLoggedInBtn.textContent = "Stay Logged In"
				}
				else
				{
					window.location = options.logouturl;
				}
			}
		});
	}
});

