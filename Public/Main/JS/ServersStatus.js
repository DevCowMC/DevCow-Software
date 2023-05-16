$(() =>
{
	let refreshTimerMins = 1
	let timeRemaining = 0;

	let timer = setInterval(Tick, 1000)
	let panel = document.getElementById("ServerStatusContainer");
	let serverRefreshTime = null;
	let serverRefreshTimeText = "The servers will refresh in ";

	let serverCardLayout = '<div class="col-md-4">\n' +
		'                    <div class="card mb-4 rounded-3 shadow-sm">\n' +
		'                        <div class="card-header py-3">\n' +
		'                            <h4 class="my-0 fw-normal text-color">SERVERID</h4>\n' +
		'                        </div>\n' +
		'                        <div class="card-body">\n' +
		'                            <ul class="list-unstyled mt-3 mb-4">\n' +
		'                                <li class="text-color">SERVERSTATUS</li>\n' +
		'                            </ul>\n' +
		'                        </div>\n' +
		'                    </div>\n' +
		'                </div>';


	function Update()
	{
		$.ajax({
			url: "https://api.devcow-software.net/v1/ptero/GetServerStatus",
			type: "GET",
			success: function(data)
			{
				let htmlServerDataArray = []

				for(let i = 0; i < data.ServerData.length; i++)
				{
					let serverData = data.ServerData[i];

					let htmlServerCard = serverCardLayout;
					htmlServerCard = htmlServerCard.replaceAll("SERVERID", serverData.ServerName);
					htmlServerCard = htmlServerCard.replaceAll("SERVERSTATUS", serverData.ServerStatus);

					htmlServerDataArray.push(htmlServerCard);
				}

				let compiledHTML = '<div class="row col-12 text-color text-right"><p id="ServerRefreshTime"></p></div><div class="row row-cols-1 row-cols-md-3 mb-3 text-center">';

				for(let h = 0; h < htmlServerDataArray.length; h++)
				{
					if((h + 1) % 3 === 0)
					{
						compiledHTML = compiledHTML + '</div>';
						if((h + 1) < htmlServerDataArray.length) compiledHTML = compiledHTML + '<div class="row row-cols-1 row-cols-md-3 mb-3 text-center">'
					}
					else
					{
						compiledHTML = compiledHTML + htmlServerDataArray[h];
					}
				}

				compiledHTML = compiledHTML + '</div>';

				panel.innerHTML = compiledHTML;
			}
		});
	}

	function Tick()
	{
		serverRefreshTime = document.getElementById("ServerRefreshTime");

		const minutes = Math.floor(timeRemaining / 60);
		const seconds = timeRemaining % 60;

		if(timeRemaining <= 0)
		{
			Update();
			timeRemaining = refreshTimerMins * 60
		}
		else
		{
			timeRemaining--;
		}

		if(serverRefreshTime == null) return;
		let minutesString = minutes == 1 ? minutes + " Minute" : minutes + " Minutes"
		let secondString = seconds == 1 ? seconds + " Second" : seconds + " Seconds"

		if(minutes > 0)
		{
			serverRefreshTime.innerText = serverRefreshTimeText + minutesString + " " + secondString
		}
		else
		{
			serverRefreshTime.innerText = serverRefreshTimeText + secondString
		}

	}
})

