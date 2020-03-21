let cities = [];

//data
const citiesAPI = 'http://api.travelpayouts.com/data/ru/cities.json',
	proxy = 'https://cors-anywhere.herokuapp.com/',
	API_KEY = 'd6e5c5a2409ffa0c1a2ea38b5365656e',
	calendar = 'http://min-prices.aviasales.ru/calendar_preload',
	MAX_COUNT = 5;

const formSearch = document.querySelector('.form-search'),
	inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
	dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
	inputCitiesTo = formSearch.querySelector('.input__cities-to'),
	dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
	inputDateDepart = formSearch.querySelector('.input__date-depart'),
	cheapestTicket = document.getElementById('cheapest-ticket'),
	otherCheapTickets = document.getElementById('other-cheap-tickets');

//functions
const getData = (url, callback) => {
	const request = new XMLHttpRequest();

	request.open('GET', url);

	request.addEventListener('readystatechange', () => {
		if (request.readyState !== 4) return;

		if (request.status === 200) {
			callback(request.response);
		} else {
			alert(`Status: ${request.status}, there is no flight for this direction!`);
		}
	});

	request.send();

	// fetch('GET', url).then(response => {
	// 	if (response.status === 200) {
	// 		console.log(response.data);
	// 	} else {
	// 		console.error(response.status);
	// 	}
	// });
}

const showCity = (input, list) => {
	list.textContent = '';

	if (input.value === '') return;

	const filteredCIties = cities.filter((item) => {
		return item.name.toLowerCase().startsWith(input.value.toLowerCase());
	});

	filteredCIties.forEach((item) => {
		const li = document.createElement('li');
		li.classList.add('dropdown__city');
		li.textContent = item.name;
		list.append(li);
	});
}

const selectCity = (event, input, list) => {
	if (event.target.tagName.toLowerCase() === 'li') {
		input.value = event.target.textContent;
		list.textContent = '';
	}
}

const getNameCity = (code) => {
	const objCity = cities.find(item => item.code === code);
	return objCity.name;
}

const getDate = (date) => {
	return new Date(date).toLocaleString('uz', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

const getChanges = (value) => {
	if (value) {
		return value === 1 ? 'One change' : 'Two changes';
	} else {
		return 'Without changes';
	}
}

const getLinkAviasales = (data) => {
	const date = new Date(data.depart_date);
	const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
	const month = date.getMonth() < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;

	// SVX2905KGD1
	return `https://www.aviasales.ru/search/${data.origin}${day}${month}${data.destination}1`;
}

const createCard = (data) => {
	const ticket = document.createElement('article');
	ticket.classList.add('ticket');
	let deep = '';

	if (data) {
		deep = `
			<h3 class="agent">${data.gate}</h3>
			<div class="ticket__wrapper">
				<div class="left-side">
					<a href="${getLinkAviasales(data)}" target="_blank" class="button button__buy">Купить
						за ${data.value}₽</a>
				</div>
				<div class="right-side">
					<div class="block-left">
						<div class="city__from">Вылет из города
							<span class="city__name">${getNameCity(data.origin)}</span>
						</div>
						<div class="date">${getDate(data.depart_date)}</div>
					</div>

					<div class="block-right">
						<div class="changes">${getChanges(data.number_of_changes)}</div>
						<div class="city__to">Город назначения:
							<span class="city__name">${getNameCity(data.destination)}</span>
						</div>
					</div>
				</div>
			</div>
		`;
	} else {
		deep = `<h3>Ticket for current date is not found!</h3>`;
	}

	ticket.insertAdjacentHTML('afterbegin', deep);
	return ticket;
}

const renderCheapDay = (cheapTicket) => {
	cheapestTicket.style.display = 'block';
	cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';

	const ticket = createCard(cheapTicket[0]);
	cheapestTicket.append(ticket);
	// console.log(cc);
}

const renderCheapYear = (cheapTickets) => {
	otherCheapTickets.style.display = 'block';
	otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';
	
	cheapTickets.sort((a, b) => a.prise - b.prise);
	
	for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
		const ticket = createCard(cheapTickets[i]);
		otherCheapTickets.append(ticket);
		
	}

	// cheapTickets.forEach(item => {
	// 	const ticket = createCard(item);
	// 	otherCheapTickets.append(ticket);
	// });
	// console.log(cheapTickets);
}

const renderCheap = (data, date) => {
	const cheapestTicketYear = JSON.parse(data).best_prices;
	const cheapestTicketDay = cheapestTicketYear.filter(item => item.depart_date === date);

	renderCheapYear(cheapestTicketYear);
	renderCheapDay(cheapestTicketDay);

}

//events
inputCitiesFrom.addEventListener('input', () => {
	showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
	showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener('click', () => {
	selectCity(event, inputCitiesFrom, dropdownCitiesFrom)
});

dropdownCitiesTo.addEventListener('click', () => {
	selectCity(event, inputCitiesTo, dropdownCitiesTo)
});

formSearch.addEventListener('submit', (event) => {
	event.preventDefault();

	const formData = {
		from: cities.find(item => item.name === inputCitiesFrom.value),
		to: cities.find(item => item.name === inputCitiesTo.value),
		when: inputDateDepart.value
	};

	if (formData.from && formData.to) {
		const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true`;

		getData(calendar + requestData, (response) => {
			renderCheap(response, formData.when);

		});
	} else {
		alert('Enter correct city name');
	}

})

document.addEventListener("DOMContentLoaded", () => {
	//call functions
	getData(proxy + citiesAPI, (data) => {
		cities = JSON.parse(data).filter(item => item.name);
	});

});
