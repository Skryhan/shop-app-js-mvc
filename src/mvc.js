/**
 * Model class. Knows everything about API endpoint and data structure. Can format/map data to any structure.
 *
 * @constructor
 */
 function Model() {

	/**
	 * Base URL.
	 * @type {string}
	 * 
	 * @constant
	 *
	 * @private
	 */
	const baseURL = `http://localhost:3000/api`

	/**
	 * URL template for getting list of stores.
	 * @type {string}
	 * 
	 * @constant
	 *
	 * @private
	 */
	const baseURLForStores = `${baseURL}/Stores`;

    /**
	 * Fetch the list of stores.
	 *
	 * @returns {Promise} the promise object will be resolved once the Stores object gets loaded.
	 *
	 * @public
	 */
	this.onLoadStores = function() {
		return this
			.sendRequest("GET", `${baseURLForStores}`)
			.then(dataOfStores => {
				return dataOfStores
			});
	};

	/**
	 * Fetch the list of stores with substring.
	 * 
	 * @param {String} searchStringForStores substring = search value.
	 * 
	 * @returns {Promise} the promise object will be resolved once the Stores object gets loaded. 
	 */
	this.onSearchStores = function(searchStringForStores) {
		return this
			.sendRequest("GET", `${baseURLForStores}?filter[where]
			[or][0][Name][regexp]=^${searchStringForStores}/i&filter[where]
			[or][1][Address][regexp]=^${searchStringForStores}/i&filter[where]
			[or][2][FloorArea][like]=${searchStringForStores}`)
			.then(dataOfStores => {
				return dataOfStores
			});
	};

	/**
	 * Fetch the list of products for currently active store.
	 *
	 * @returns {Promise} the promise object will be resolved once the Products object gets loaded.
	 * 
	 * @param {number} storeID id of active store
	 * @param {string} path of URL with filter
	 *
	 * @public
	 */
	this.onloadProducts = function(storeID, path = ``){
		return this
			.sendRequest("GET", `${baseURLForStores}/${storeID}/rel_Products${path}`)
			.then(dataOfProducts => {
				return dataOfProducts
			}) 
	};

	/**
	 * Fetch the list of products for currently active store with substring.
	 *
	 * @returns {Promise} the promise object will be resolved once the Products object gets loaded.
	 * 
	 * @param {number} storeID id of active store
	 * @param {string} path of URL with filter
	 *
	 * @public
	 */
	 this.onSearchProducts = function(storeID, searchStringForProducts){
		return this
			.sendRequest("GET", `${baseURLForStores}/${storeID}/rel_Products?filter[where]
			[or][0][Name][regexp]=^${searchStringForProducts}/i&filter[where]
			[or][1][Specs][regexp]=^${searchStringForProducts}/i&filter[where]
			[or][2][SupplierInfo][regexp]=^${searchStringForProducts}/i&filter[where]
			[or][3][MadeIn][regexp]=^${searchStringForProducts}/i&filter[where]
			[or][4][ProductionCompanyName][regexp]=^${searchStringForProducts}/i&filter[where]
			[or][5][Price][like]=${searchStringForProducts}`)
			.then(dataOfProducts => {
				return dataOfProducts
			}) 
	};
	

	/**
	 * Common method which "promisifies" the fetch calls.
	 *
	 * @param {string} method the method to fetch
	 * @param {string} url the URL address to fetch.
	 *
	 * @returns {Promise} the promise object will be resolved once fetch call gets loaded/failed.
	 *
	 * @public
	 */
	this.sendRequest = function (method, url) {
		return fetch(url).then(response => {
			if (response.status <= 400){
				return response.json()
			};
			if (response.status = 404){
				const $main = document.querySelector("#main");
				$main.innerHTML = `<h4>404 Not found</h4>`;
			};
			return response.json().then(error => {
				const e = new Error("Error");
				e.data = error;
				throw e;
			})
		})
	};

	/**
	 * Common method to send request to create store or product.
	 *
	 * @param {string} url the method to fetch
	 * @param {Object} obj data from form.
	 * @param {string} path of URL for create a new product
	 * 
	 * @example http://localhost:3000/api/Stores/9/rel_Products - url for create a new product for store with id = 9
	 *
	 * @returns {Promise} the promise object will be resolved once fetch call gets loaded/failed.
	 *
	 * @public
	 */
	this.sendRequestForCreate = function (obj, path = ``) {
		return fetch(`${baseURLForStores}/${path}`, {
            method: 'POST',
            body:JSON.stringify(obj),
            headers:{'content-type': 'application/json'}})

	};

	/**
	 * Common method to send request to delete store or product.
	 *
	 * @param {string} url to identify a product or store to remove. 
	 *
	 * @returns {Promise} the promise object will be resolved once fetch call gets loaded/failed.
	 *
	 * @public
	 */
	this.sendRequestForDelete = function (url) {
		return fetch(url, {
			method: "DELETE",
		})
	};

	/**
	 * Method to send request to delete store.
	 *
	 * @param {number} storeID id of active store
	 *
	 * @returns {Promise} the promise object will be resolved once fetch call gets loaded/failed.
	 *
	 * @public
	 */
	this.sendRequestForDeleteStore = function (storeID) {
		return this
			.sendRequestForDelete(`${baseURLForStores}/${storeID}`)
			.then()
	};

	/**
	 * Method to send request to delete product.
	 *
	 * @param {number} storeID id of active store.
	 * @param {number} productID id of product, which need to delete.
	 *
	 * @returns {Promise} the promise object will be resolved once fetch call gets loaded/failed.
	 *
	 * @public
	 */
	this.sendRequestForDeleteProduct = function (storeID, productID) {
		return this
			.sendRequestForDelete(`${baseURLForStores}/${storeID}/rel_Products/${productID}`)
			.then();
	};

	/**
	 * Returns sorted array of products.
	 * 
	 * @param {Object[]} array current array of products
	 * @param {string} sort by Name/Price/Specs/Supplier info/Country of origin/Prod. company/Rating
	 * @param {boolean} desc flag for specifying sorting: ascending or descending. Default ascending.
	 * 
	 * @returns {Object[]} with active sort
	 */
	 this.sortArrayBy = function (array, sort, desc) {

		array.sort((a, b) => (a[sort] < b[sort]) ? -1 : 1)
		if (desc) array.reverse()
		return array
	};
}

/**
 * View class. Knows everything about dom & manipulation and a little bit about data structure, which should be
 * filled into UI element.
 *
 * @constructor
 */
function View() {

	/**
	 * Returns the button for all products
	 * 
	 * @returns {HTMLElement} the button element
	 * 
	 * @public
	 */
	this.getHeaderStatusAll = function () {
		const $headerText = document.querySelector(".header-text");
		return $headerText

	};

	/**
	 * Returns the button for products with OK status
	 * 
	 * @returns {HTMLElement} the button element
	 * 
	 * @public
	 */
	this.getHeaderOk = function () {
		const $headerOk = document.querySelector(".header-ok");
		return $headerOk
	};

	/**
	 * Returns the button for products with STORAGE status
	 * 
	 * @returns {HTMLElement} the button element
	 * 
	 * @public
	 */
	this.getHeaderStorage = function () {
		const $headerStorage = document.querySelector(".header-storage");
		return $headerStorage
	};

	/**
	 * Returns the button for products with OUT_of_STOCK status.
	 * 
	 * @returns {HTMLElement} the button element.
	 * 
	 * @public
	 */
	this.getHeaderOut = function () {
		const $headerOut = document.querySelector(".header-out");
		return $headerOut
	};

    /**
	 * Returns the button for search stores.
	 * 
	 * @returns {HTMLElement} the button element.
	 * 
	 * @public
	 */
    this.getBtnSearchStores = function () {
        const $btnSearchStores = document.querySelector(".icon-search-stores");	
        return $btnSearchStores
    };

    /**
	 * Returns the button for search products.
	 * 
	 * @returns {HTMLElement} the button element.
	 * 
	 * @public
	 */
    this.getBtnSearchProducts = function () {
        const $btnSearchProducts = document.querySelector(".icon-search-products");
        return $btnSearchProducts
    };

    /**
	 * Returns the button for refresh products.
	 * 
	 * @returns {HTMLElement} the button element
	 * 
	 * @public
	 */
    this.getBtnRefreshProducts = function () {
        const $btnRefreshProducts = document.querySelector(".icon-refresh-products");
        return $btnRefreshProducts
    };

     /**
	 * Returns the button for delete input value (stores).
	 * 
	 * @returns {HTMLElement} the button element
	 * 
	 * @public
	 */
    this.getBtnCrossStores = function () {
        const $btnCrossStores = document.querySelector(".icon-cross-stores");
        return $btnCrossStores
    };

    /**
	 * Returns the button for refresh products.
	 * 
	 * @returns {HTMLElement} the button element
	 * 
	 * @public
	 */
    this.getBtnRefreshStores = function () {
        const $btnRefreshStores = document.querySelector(".icon-refresh-stores");
        return $btnRefreshStores
    };

    /**
	 * Returns the button for delete input value (products).
	 * 
	 * @returns {HTMLElement} the button element
	 * 
	 * @public
	 */
    this.getBtnCrossProducts = function () {
        const $btnCrossProducts = document.querySelector(".icon-cross-products");
        return $btnCrossProducts
    };

	/**
	 * The first section header with info about active store.
	 * 
	 * @constant
	 */
	const $firstSectionHeader = document.querySelector(".first-header-section");

	/**
	 * The second section header with filter of products buttons by status.
	 * 
	 * @constant
	 */
	const $secondSectionHeader = document.querySelector(".second-header-section");

	/**
	 * Title of table with search panel.
	 * 
	 * @constant
	 */
	const $tableTitle = document.querySelector(".table-title");

	/**
	 * Method to get wrapper for for table body.
	 * 
	 * @returns {HTMLDivElement} wrapper for table body.
	 * 
	 * @public
	 */
    this.getTableWrap = function () {
	    const $tableWrap = document.querySelector(".table-wrapper");
        return $tableWrap
    }

	/**
	 * Title of section.
	 * 
	 * @constant
	 */
	const $sectionTitle = document.querySelector(".js-header-title");

	
    /**
	 * Div with amount products
	 * 
	 * @constant
	 */
    const $storeAmount = document.querySelector(".store-amount");

    /**
     * Div with amount products with OK status
     * 
     * @constant
     */
    const $statusOk = document.querySelector(".status-ok");

    /**
     * Div with amount products with STORAGE status
     * 
     * @constant
     */
    const $statusStorage = document.querySelector(".status-storage");

    /**
     * Div with amount products with OUT_OF_STOCK status
     * 
     * @constant
     */
    const $statusOut = document.querySelector(".status-out");
	

	/**
	 * Method to get wrapper for all store-items
	 * 
	 * @returns {HTMLDivElement} wrapper for all store-items
	 * 
	 * @public
	 */
	this.getAllArticles = function () {
		const $articles = document.querySelector(".js-articles");
		return $articles
	};

	/**
	 * Method to get input for search stores.
	 * 
	 * @returns {HTMLInputElement} with input for search stores.
	 */
	 this.getSearchInputStore = function () {
		const $storesSearchInput = document.querySelector(".stores-search-input");
		return $storesSearchInput
	};

	/**
	 * Method to get input for search products.
	 * 
	 * @returns {HTMLInputElement} with input for search products.
	 */
	 this.getProductSearchInput = function () {
		const $productsSearchInput = document.querySelector(".products-search-input");
		return $productsSearchInput
	}

	/**
	 * Returns modal window for creating a store.
	 * 
	 * @returns {HTMLDivElement} the modal window with form.
	 */
	this.getModalCreateStore = function () {
		const $modalCreateStore = document.querySelector(".modal-wrapper-create-store");
		return $modalCreateStore
	}

	/**
	 * Returns modal window for creating a product.
	 * 
	 * @returns {HTMLDivElement} the modal window with form.
	 */
	this.getModalCreateProduct = function () {
		const $modalCreateProduct = document.querySelector(".modal-wrapper-create-product");
		return $modalCreateProduct
	}

	 /**
	  * Returns modal window to confirm product removal.
	  * 
	  * @returns {HTMLDivElement} the modal window to confirm product removal with two buttons: ok and cancel.
	  */
	this.getConfirmDeleteProduct = function () {
		const $confirmDeleteProduct = document.querySelector(".modal-wrapper-confirm-delete-product");
		return $confirmDeleteProduct
	};
 
	 /**
	  * Returns modal window to confirm store removal.
	  * 
	  * @returns {HTMLDivElement} the modal window to confirm store removal with two buttons: ok and cancel.
	  */
	this.getConfirmDeleteStore = function () {
	 	const $confirmDeleteStore = document.querySelector(".modal-wrapper-confirm-delete-store");
		 return $confirmDeleteStore
	};
 
	 /**
	  * Returns notification with message.
	  * 
	  * @returns {HTMLDivElement} with notification about creating or removing product.
	  */
	this.getPopup = function () {
	 	const $popup = document.querySelector(".popup");
		return $popup
	};

	/**
	 * Common method for adding a class "active"
	 * 
	 * @param {HTMLElement} elem 
	 */
	this.addActiveClass = function (elem) {
		elem.classList.add("active")
	};

	/**
	 * Common method for removing a class "active"
	 * 
	 * @param {HTMLElement} elem 
	 */
	this.removeActiveClass = function (elem) {
		elem.classList.remove("active")
	};

	/**
	 * Fill the data into aside with all stores.
	 *
	 * @param {Object[]} dataOfStores the stores data array.
	 *
	 */
	this.renderStores = function (dataOfStores) {

    	this.getAllArticles().innerHTML = "";

		for (let el of dataOfStores) {
			this.getAllArticles().innerHTML += `<article class="article store-item" id=${el.id} about=${el.id}>
				<div class="article-wrap">
					<div class="article-content-main">
					<p class="shop-name long-text">${el.Name}</p>
					<div>
						<p>${el.FloorArea}</p>
						<p class="sq-m">sq.m</p>
					</div>
					</div>
					<div>
						<p class="shop-address">${el.Address}</p>
					</div>
				</div>
			</article>`
		}
	};

	/**
	 * Show section, when no active store.
	 *
	 */
	this.showSectionWithoutProducts = function () {

		$sectionTitle.innerHTML = "Store is not selected";
    	this.getTableWrap().innerHTML = `<div class="table-without-products">
			<i class="fas fa-store-alt"></i>
			<p class="title">The store is not selected</p>
			<p class="text-grey">Please select the store to proceed</p>
    	</div>`;
		$firstSectionHeader.classList.remove("active");
        $secondSectionHeader.classList.remove("active");
        $tableTitle.classList.remove("active")
	};

	/**
	 * Fill the data into table of products.
	 *
	 * @param {Object[]} dataOfProducts the products data array.
	 *
	 * @public
	 */
	this.renderProductTable = function (dataOfProducts) {

		$sectionTitle.classList.remove("center");
		$tableTitle.classList.add("active");
		$sectionTitle.innerHTML = "Stores Details"
		this.getTableWrap().innerHTML = `<table class="table">
			<thead class="thead">
				<tr>
					<th class="th table-nav-name"><i class="fas fa-sort"></i>Name</th>
					<th class="th table-nav-price table-product-price"><i class="fas fa-sort"></i>Price</th>
					<th class="th table-nav-specs"><i class="fas fa-sort"></i>Specs</th>
					<th class="th table-nav-supplierinfo"><i class="fas fa-sort"></i>SupplierInfo</th>
					<th class="th table-nav-country country-none"><i class="fas fa-sort"></i>Country of origin</th>
					<th class="th table-nav-company company-none"><i class="fas fa-sort"></i>Prod. company</th>
					<th class="th table-nav-rating rating-none"><i class="fas fa-sort"></i>Rating</th>
				</tr>
			</thead>
			<tbody class="tbody"></tbody>
		</table>`

		const rating1 = `
		<i class="fas fa-star"></i>
		<i class="far fa-star"></i>
		<i class="far fa-star"></i>
		<i class="far fa-star"></i>
		<i class="far fa-star"></i>`

		const rating2 = `
		<i class="fas fa-star"></i>
		<i class="fas fa-star"></i>
		<i class="far fa-star"></i>
		<i class="far fa-star"></i>
		<i class="far fa-star"></i>`

		const rating3 = `
		<i class="fas fa-star"></i>
		<i class="fas fa-star"></i>
		<i class="fas fa-star"></i>
		<i class="far fa-star"></i>
		<i class="far fa-star"></i>`

		const rating4 = `
		<i class="fas fa-star"></i>
		<i class="fas fa-star"></i>
		<i class="fas fa-star"></i>
		<i class="fas fa-star"></i>
		<i class="far fa-star"></i>`

		const rating5 = `
		<i class="fas fa-star"></i>
		<i class="fas fa-star"></i>
		<i class="fas fa-star"></i>
		<i class="fas fa-star"></i>
		<i class="fas fa-star"></i>`

		const $tbody = document.querySelector(".tbody")

		for (let el of dataOfProducts) {
			$tbody.innerHTML += `<tr id=${el.id}>
				<td>
					<p class="table-produsct-name long-text">${el.Name}</p>
					<p>${el.id}</p>
				</td>
				<td class="table-product-price" nowrap>
					<p><span>${el.Price}</span> USD</p>
				</td>
				<td class="long-text">
					<p title="${el.Specs}">${el.Specs}</p>
				</td>
				<td class="long-text">
					<p title="${el.SupplierInfo}">${el.SupplierInfo}</p>
				</td>
				<td class="long-text contry-none">
					<p>${el.MadeIn}</p>
				</td>
				<td class="long-text company-none">
					<p>${el.ProductionCompanyName}</p>
				</td>
				<td class="rating-none" nowrap>
					<div class="rating">
							<div>
								${el.Rating === 1 ? rating1 :
								el.Rating === 2 ? rating2 :
								el.Rating === 3 ? rating3 :
								el.Rating === 4 ? rating4 :
								el.Rating === 5 ? rating5 : null}
							</div>
                            <div class="for-id-product" about=${el.id} nowrap>
								<i class="far fa-times-circle delete-product"></i>
							</div>
					</div>
				</td>
			</tr>`
		}
	};

	/**
	 * Show section with data about store.
	 *
	 * @param {Object} activeStore active store.
	 *
	 * @public
	 */
	this.renderHeaderWithInfoAboutStore = function (activeStore) {

		$firstSectionHeader.classList.add("active")
		$firstSectionHeader.innerHTML = `<div class="header-content">
		<div class="header-content-col">
			<div class="header-cont-string">
				<p class="header-cont-col-bold">Email: </p>
				<p>${activeStore.Email}</p>
			</div>
			<div class="header-cont-string">
				<p class="header-cont-col-bold">Phone Number: </p>
				<p>${activeStore.PhoneNumber}</p>
			</div>
			<div class="header-cont-string">
				<p class="header-cont-col-bold">Address: </p>
				<p>${activeStore.Address}</p>
			</div>
		</div>
		<div class="header-content-col">
			<div class="header-cont-string">
				<p class="header-cont-col-bold">Established Date:</p>
				<p>${activeStore.Established.slice(5, 7) === '01' ? 'Jan' :
				activeStore.Established.slice(5, 7) === '02' ? 'Feb' :
				activeStore.Established.slice(5, 7) === '03' ? 'Mar' :
				activeStore.Established.slice(5, 7) === '04' ? 'Apr' :
				activeStore.Established.slice(5, 7) === '05' ? 'Mai' :
				activeStore.Established.slice(5, 7) === '06' ? 'Jnn' :
				activeStore.Established.slice(5, 7) === '07' ? 'Jnl' :
				activeStore.Established.slice(5, 7) === '08' ? 'Aug' :
				activeStore.Established.slice(5, 7) === '09' ? 'Sep' :
				activeStore.Established.slice(5, 7) === '10' ? 'Oct' :
				activeStore.Established.slice(5, 7) === '11' ? 'Nov' :
				activeStore.Established.slice(5, 7) === '12' ? 'Dec' : null}
				${activeStore.Established.slice(8, 10)}, ${activeStore.Established.slice(0, 4)} </p>
			</div>
			<div class="header-cont-string">
				<p class="header-cont-col-bold">Floor Area:</p>
				<p>${activeStore.FloorArea}</p>
			</div>
		</div>
	</div>`
	};

	/**
	 * Show section with filter of products by status.
	 *
	 * @param {Object[]} dataOfProducts data of products for active store.
	 *
	 * @public
	 */
	this.renderHeaderWithStatusOfProducts = function (dataOfProducts) {

		let statusOk = 0;
		let statusStorage = 0;
		let statusOut = 0;

		for (let el of dataOfProducts) {
			if (el.Status === "OUT_OF_STOCK") {
				statusOut += 1
			} else if (el.Status === "OK") {
				statusOk += 1
			} else if (el.Status === "STORAGE") {
				statusStorage += 1
			} else {
				return null
			}
		}
		$secondSectionHeader.classList.add("active");
		$storeAmount.innerHTML = `${dataOfProducts.length}`;
		$statusOk.innerHTML = `${statusOk}`;
		$statusStorage.innerHTML = `${statusStorage}`;
		$statusOut.innerHTML = `${statusOut}`;
		this.clearClassBtnByStatus();
		this.getHeaderStatusAll().classList.add("active");
	};

	/**
	 * Remove active filter buttons by status .
	 *
	 * @public
	 */
	this.clearClassBtnByStatus = function () {

		this.getHeaderStatusAll().classList.remove("active");
		this.getHeaderOk().classList.remove("active");
		this.getHeaderStorage().classList.remove("active");
		this.getHeaderOut().classList.remove("active");
		this.getProductSearchInput().value = "";
	};

	/**
	 * Remove input.value in forms, error classes, hide modal window.
	 *
	 * @param {HTMLFormElement} form with create store or product.
	 *
	 * @public
	 */
	this.clearForm = function (form) {

		const $inputs = form.getElementsByTagName("input");
		for (let $input of $inputs) {
			$input.classList.remove("error");
			$input.value = '';
		}
		document.getElementById("phone-message").innerHTML = "";
		document.getElementById("email-message").innerHTML = "";
	};

	/**
	 * Clear search form after click "cross"
	 * 
	 * @param {HTMLInputElement} input of search form (Stores or Products).
	 * @param {HTMLElement} btnCross of search form (Stores or Products).
	 * @param {HTMLElement} btnRefresh of search form (Stores or Products).
	 */
	this.clearSearchInput = function (input, btnCross, btnRefresh) {
		input.value = "";
		btnCross.classList.add("non-active");
		btnRefresh.classList.remove("non-active");
	};

    /**
     * Common method to show preloader.
     * 
     * @param {HTMLElement} elem 
     */
	this.showPreloader = function (elem) {
		elem.innerHTML = `
		<div class="preloader">
            <img src="./assets/images/preloader.gif" alt="">
        </div>`
	};

    /**
     * Method for collecting data from a form to create a product.
     * 
     * @returns obj with values from form.
     */
    this.formCreateProductValues = function () {

        let name = this.getModalCreateProduct().querySelector('[name="Name"]');
        let price = this.getModalCreateProduct().querySelector('[name="Price"]');
        let specs = this.getModalCreateProduct().querySelector('[name="Specs"]');
        let rating = this.getModalCreateProduct().querySelector('[name="Rating"]');
        let supplierInfo = this.getModalCreateProduct().querySelector('[name="SupplierInfo"]');
        let madeIn = this.getModalCreateProduct().querySelector('[name="MadeIn"]');
        let productionCompanyName = this.getModalCreateProduct().querySelector('[name="ProductionCompanyName"]');
        let status = this.getModalCreateProduct().querySelector('[name="Status"]');

		let obj = {
            Name: name.value,
            Price: price.value,
            Photo: name.value,
            Specs: specs.value,
            Rating: rating.value,
            SupplierInfo: supplierInfo.value,
            MadeIn: madeIn.value,
            ProductionCompanyName: productionCompanyName.value,
            Status: status.value,
        };
        return obj
    };

    /**
     * Method for collecting data from a form to create a store.
     * 
     * @returns obj with values from form.
     */
    this.formCreateStoreValues = function () {

        let name = this.getModalCreateStore().querySelector('[name="Name"]');
			let email = this.getModalCreateStore().querySelector('[name="Email"]');
			let phoneNumber = this.getModalCreateStore().querySelector('[name="PhoneNumber"]');
			let address = this.getModalCreateStore().querySelector('[name="Address"]');
			let established = this.getModalCreateStore().querySelector('[name="Established"]');
			let floorArea = this.getModalCreateStore().querySelector('[name="FloorArea"]');
		
			let obj = {
				Name: name.value,
				Email: email.value,
				PhoneNumber: phoneNumber.value,
				Address: address.value,
				Established: established.value,
				FloorArea: floorArea.value,
				id: established.value
            }
        return obj
    } 
		
}

/**
 * Controller class. Orchestrates the model and view objects. A "glue" between them.
 *
 * @param {View} view view instance.
 * @param {Model} model model instance.
 *
 * @constructor
 */
function Controller (view, model) {

	const that = this;

	/**
	 * Id for active store
	 * 
	 * @type {number} 
	 * 
	 */
	let storeID;

	/**
	 * Id for active product
	 * 
	 * @type {number} 
	 * 
	 */
	let productID;

	/**
	 * Flag for specifying the sort order. Default value - false.
	 * 
	 * @type {boolean}
	 */
	let desc = false;

	/**
	 * Flag to determine if there are validation errors. Default value - false.
	 * 
	 * @type {boolean}
	 */
	let errors = false;

	/**
	 * Value from store search input . Default value - empty string.
	 * 
	 * @type {string}
	 */
	let searchStringForStores = "";

	/**
	 * Value from product search input . Default value - empty string.
	 * 
	 * @type {string}
	 */
	let searchStringForProducts = "";


	const $btnSearchStores = view.getBtnSearchStores()
	const $btnSearchProducts = view.getBtnSearchProducts()
    const $btnRefreshProducts = view.getBtnRefreshProducts();
	const $btnCrossStores = view.getBtnCrossStores();
	const $btnRefreshStores = view.getBtnRefreshStores();
	const $btnCrossProducts = view.getBtnCrossProducts();
	const $storesSearchInput = view.getSearchInputStore();
	const $productsSearchInput = view.getProductSearchInput();

	/**
	 * Initialize controller.
	 *
	 * @public
	 */
	this.init = function () {

		const $headerText = view.getHeaderStatusAll();
		const $headerOk = view.getHeaderOk();
		const $headerStorage = view.getHeaderStorage();
		const $headerOut = view.getHeaderOut();		

		window.addEventListener("load", this.loadDocument);
		document.addEventListener("click", this.changeInputIcons);
		document.addEventListener("click", this.sortTable);
		document.addEventListener("click", this.modalWindowControl);
		document.addEventListener("click", this.getProductID);
		$headerText.addEventListener("click", this.showActiveStatusAll);
		$headerOk.addEventListener("click", this.showActiveStatusOk);
		$headerStorage.addEventListener("click", this.showActiveStatusStorage);
		$headerOut.addEventListener("click", this.showActiveStatusOut);
		$btnSearchStores.addEventListener("click", this.searchStores);
		$storesSearchInput.addEventListener("change", this.getValueFromSearchInputStores);
		$btnCrossStores.addEventListener("click", this.clearSearchInputStores);
		$productsSearchInput.addEventListener("change", this.getValueFromSearchInputProducts);
		$btnSearchProducts.addEventListener("click", this.searchProducts);
		$btnCrossProducts.addEventListener("click", this.clearSearchInputProducts);
		
		
	}
	/**
	 * Load stores into aside on page load.
	 *
	 * @listens load
	 *
	 * @param {Event} e the DOM event object.
	 *
	 * @private
	 */
	this.loadDocument = function (e) {
		model
			.onLoadStores()
			.then(function (dataOfStores){
				view.renderStores (dataOfStores);
				view.showSectionWithoutProducts();
				that.getCurrentStore();
			});
	};
	
	/**
	 * Get active store (clicked on) and show product table for it.
	 */
	this.getCurrentStore = function () {
		
		model
			.onLoadStores()
			.then(function (dataOfStores){
				const $articleItems = document.querySelectorAll(".store-item");
				
				$articleItems.forEach(fetchStore);

				function fetchStore(article) {

					article.addEventListener("click", function () {

						let currentArticle = article
						if (!currentArticle.classList.contains("active")) {
							$articleItems.forEach(function (item) {
								item.classList.remove("active")
							})
							currentArticle.classList.add("active")

							const articleArray = Array.from($articleItems)
							for (let el of articleArray) {
								if (el.classList.contains("active")) {
									storeID = +el.getAttribute("About")
								}
								$productsSearchInput.value = "";
							};
                            view.showPreloader(view.getTableWrap())
							model
								.onloadProducts(storeID)
								.then( function (dataOfProducts) {
									view.renderProductTable(dataOfProducts);
									view.renderHeaderWithStatusOfProducts(dataOfProducts);
								})

							let currentStore;

							for (let el of dataOfStores){
								if (el.id === storeID){
									currentStore = el
								}
							};
							view.renderHeaderWithInfoAboutStore(currentStore)
						}
					})
				}
			})
	};

	/**
	 * Get product ID for edit or delete it.
	 * 
	 * @param {Event} e the DOM event object.
	 * 
	 * @returns {number} of active delete product button.
	 */
	 this.getProductID = function (e) {

		const $btnDeleteProduct = document.querySelectorAll(".for-id-product")
    	$btnDeleteProduct.forEach(fetchProduct)

            function fetchProduct(product) {

                product.addEventListener("click", function () {

                    let currentProductTr = product
                    if (!currentProductTr.classList.contains("active")) {
                        $btnDeleteProduct.forEach(function (product) {
                            product.classList.remove("active")
                        })
                        currentProductTr.classList.add("active")
                        const productArray = Array.from($btnDeleteProduct)

                        for (let el of productArray) {
                            if (el.classList.contains("active")) {
                                productID = +el.getAttribute("About")
                                view.addActiveClass(view.getConfirmDeleteProduct())
                                el.classList.remove("active")
                            }
                        }
                    }
                })
            }
	};

	/**
	 * Method that shows that all products are currently in the table.
	 */
	this.showActiveStatusAll = function() {
		view.clearClassBtnByStatus();
        view.getHeaderStatusAll().classList.add("active");
		that.showProductsForStatus()
	};

	/**
	 * Method that shows that products with status OK are currently in the table.
	 */
	this.showActiveStatusOk = function () {
		view.clearClassBtnByStatus();
        view.getHeaderOk().classList.add("active");
		that.showProductsForStatus("OK")
	};

	/**
	 * Method that shows that products with status STORAGE are currently in the table.
	 */
	this.showActiveStatusStorage = function () {
		view.clearClassBtnByStatus();
        view.getHeaderStorage().classList.add("active");
		that.showProductsForStatus("STORAGE")
	};

	/**
	 * Method that shows that products with status OUT_OF_STOCK are currently in the table.
	 */
	this.showActiveStatusOut = function () {
		view.clearClassBtnByStatus();
        view.getHeaderOut().classList.add("active");
		that.showProductsForStatus("OUT_OF_STOCK")
	};

	/**
	 * Method that renders the table with products depending on the current filter by status. 
	 * 
	 * @param {string} status that can be OK/STORAGE/OUT_OF_STOCK
	 */
	this.showProductsForStatus = function (status) {

		if (!status) {
            view.showPreloader(view.getTableWrap())
			model
			.onloadProducts(storeID)
			.then( function (dataOfProducts) {
				view.renderProductTable(dataOfProducts);
			})
		} else {
            view.showPreloader(view.getTableWrap())
			model
			.onloadProducts(storeID, `?filter=%7B%22where%22%3A%20%7B%22Status%22%3A%20%22${status.toUpperCase()}%22%7D%7D`)
			.then( function (dataOfProducts) {
				view.renderProductTable(dataOfProducts);
			})
		}
	};

	/**
	 * Render table of products with active sort.
	 * 
	 * @param {string} param sort by Name/Price/Specs/Supplier info/Country of origin/Prod. company/Rating
	 */
	this.getSort = function (param) {

		model
		.onloadProducts(storeID, ``)
		.then(dataOfProducts => {
			let array = model.sortArrayBy(dataOfProducts, param, desc)
			view.renderProductTable(array)
			desc = !desc
		})
	
	};

	/**
	 * Sort table of products with active sort.
	 * 
	 * @listens click
	 *
	 * @param {Event} e the DOM event object.
	 *
	 * @private
	 */
	this.sortTable = function (e) {

		if (e.target.classList.contains("table-nav-name")) {
			that.getSort("Name")
		}
		if (e.target.classList.contains("table-nav-price")) {
			that.getSort("Price")
		}
		if (e.target.classList.contains("table-nav-specs")) {
			that.getSort("Specs")
		}
		if (e.target.classList.contains("table-nav-supplierinfo")) {
			that.getSort("SupplierInfo")
		}
		if (e.target.classList.contains("table-nav-country")) {
			that.getSort("MadeIn")
		}
		if (e.target.classList.contains("table-nav-company")) {
			that.getSort("ProductionCompanyName")
		}
		if (e.target.classList.contains("table-nav-rating")) {
			that.getSort("Rating")
		}
	}

	/**
	 * Method method for controlling the opening and closing of modal windows.
	 * 
	 * @param {Event} e the DOM event object.
	 */
	this.modalWindowControl = function (e) {

		if (e.target.classList.contains("footer-btn-create-store")) {
			view.addActiveClass(view.getModalCreateStore())
		}
		if (e.target.classList.contains("footer-btn-create-product") && storeID > 0) {
			view.addActiveClass(view.getModalCreateProduct())
		}
		if (e.target.classList.contains("btn-create-store-cancel")) {
			view.clearForm(view.getModalCreateStore());
			view.removeActiveClass(view.getModalCreateStore())
		}
		if (e.target.classList.contains("btn-create-product-cancel")) {
			view.clearForm(view.getModalCreateProduct());
			view.removeActiveClass(view.getModalCreateProduct())
		}
		if (e.target.classList.contains("btn-create-store-create")) {
			that.validate(view.getModalCreateStore(), that.createStore())
		}
		if (e.target.classList.contains("btn-create-product-create")) {
			that.validate(view.getModalCreateProduct(), that.createProduct())
		}
		if (e.target.classList.contains("delete-store") && storeID >= 0){
			view.addActiveClass(view.getConfirmDeleteStore())
		}
		if (e.target.classList.contains("btn-confirm-del-store-ok")){
			view.removeActiveClass(view.getConfirmDeleteStore());
			that.deleteStore()
		}
		if (e.target.classList.contains("btn-confirm-del-store-cancel")){
			view.removeActiveClass(view.getConfirmDeleteStore())
		}
		if (e.target.classList.contains("btn-confirm-del-prod-ok")){
			view.removeActiveClass(view.getConfirmDeleteProduct())
			that.deleteProduct()
		}
		if (e.target.classList.contains("btn-confirm-del-prod-cancel")){
			view.removeActiveClass(view.getConfirmDeleteProduct())
		}
	}

	this.changeInputIcons = function (e) {

		if (e.target.classList.contains("stores-search-input")) {
			$btnRefreshStores.classList.add("non-active");
			$btnCrossStores.classList.remove("non-active");
		}
		if (e.target.classList.contains("products-search-input")) {
			$btnRefreshProducts.classList.add("non-active");
			$btnCrossProducts.classList.remove("non-active");
		}
	};

	/**
	 * Сollect input values and send data to the server.
	 */
	this.createStore = function () {

		if (!errors) {

            let obj = view.formCreateStoreValues();

			model
			.sendRequestForCreate(obj)
			.then(function (response) {
				if (response.status <= 400){
					view.clearForm(view.getModalCreateStore());
                    view.removeActiveClass(view.getModalCreateStore())
					model
					.onLoadStores()
					.then(function (dataOfStores){
						that.getCurrentStore()
						view.renderStores (dataOfStores);
					});
				}
			})    
			
			errors = false

		}

	};

	/**
	 * Delete the data of the selected store from the server.
	 */
	this.deleteStore = function () {

		model
            .sendRequestForDeleteStore(storeID)
            .then(function() {
                return model.onLoadStores();
            })
            .then(function(dataOfStores) {
                view.renderStores(dataOfStores);
                view.showSectionWithoutProducts();
                that.getCurrentStore();
            });

	};

	/**
	 * Сollect input values and send data to the server.
	 */
	this.createProduct = function () {

       
        let obj = view.formCreateProductValues()

        model
        .sendRequestForCreate(obj, `${storeID}/rel_Products`)
        .then(function (response) {
            if (response.status <= 400){
                view.clearForm(view.getModalCreateProduct());
                view.removeActiveClass(view.getModalCreateProduct())
                view.getPopup().innerHTML = `<p>The product has been successfully created!</p>`
                view.addActiveClass(view.getPopup())
                    setTimeout(() => {
                        view.removeActiveClass(view.getPopup())
                    }, 2000)
                model
                .onloadProducts(storeID)
                .then(function (dataOfProducts){
                    view.renderHeaderWithStatusOfProducts(dataOfProducts);
                    view.renderProductTable (dataOfProducts);
                })

            }
        })

        errors = false
		 
	};

	/**
	 * Delete the data of the selected product from the server.
	 */
	this.deleteProduct = function () {
	
		model
		.sendRequestForDeleteProduct(storeID, productID)
		.then(function() {
			view.getPopup().innerHTML = `<p>The product has been successfully deleted!</p>`
			view.addActiveClass(view.getPopup())
            setTimeout(() => {
                view.removeActiveClass(view.getPopup())
            }, 2000)
			return model.onloadProducts(storeID);
		})
		.then(function (dataOfProducts) {
			view.renderProductTable(dataOfProducts)
			view.renderHeaderWithStatusOfProducts(dataOfProducts)
		})
		
	};

	/**
	 * Method that checks the correctness of the entered data.
	 * 
	 * @param {HTMLDivElement} form active modal window: create store or create product
	 * @param {Object} fn with function, which need to do when no errors
	 */
	this.validate = function (form, fn) {

		const $inputs = form.getElementsByTagName("input");
		errors = false;
		for (let $input of $inputs) {
			$input.classList.remove("error");
			if (!$input.value) {
				errors = true;
				$input.classList.add("error");
			}
		}
		const $emailInput = document.getElementById("email")
		const re = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
		let emailText = $emailInput.value;
		let valid = re.test(emailText);
		if (!valid) {
			$emailInput.classList.add("error");
			document.getElementById("email-message").innerHTML = "example: hi@gmail.com";
			errors = true
		}

		if (!errors) {
			fn;
		}

	};

	/**
	 * Method that send request to server with input.value for search stores.
	 */
	this.searchStores = function () {

        view.showPreloader(view.getAllArticles())
		model
		.onSearchStores(searchStringForStores)
			.then(dataOfStores => {
				view.renderStores(dataOfStores)
				that.getCurrentStore()
				searchStringForStores = ""
			})
		
	
	};

	/**
	 * Is called when click "cross" in search panel (for stores).
	 */
	this.clearSearchInputStores = function () {

		model
		.onLoadStores()
			.then(dataOfStores => {
					view.renderStores(dataOfStores)
					that.getCurrentStore()
					view.clearSearchInput($storesSearchInput, $btnCrossStores, $btnRefreshStores)
			})		
	};

	/**
	 * Writes the value from the input to searchStringForStores
	 * 
	 * @param {Event} e the DOM event object.
	 * 
	 * @returns input value for search stores.
	 */
	this.getValueFromSearchInputStores = function (e) {
		
		searchStringForStores = e.target.value.toLowerCase();
		return searchStringForStores
	};

	/**
	 * Writes the value from the input to searchStringForProducts
	 * 
	 * @param {Event} e the DOM event object.
	 * 
	 * @returns input value for search products.
	 */
	this.getValueFromSearchInputProducts = function (e) {
		
		searchStringForProducts = e.target.value.toLowerCase();
		return searchStringForProducts
	};

	/**
	 * Method that send request to server with input.value for search products.
	 */
	this.searchProducts = function () {

        view.showPreloader(view.getTableWrap())
		model
		.onSearchProducts(storeID, searchStringForProducts)
			.then(dataOfProducts => {
				view.renderProductTable(dataOfProducts)
				that.getCurrentStore()
				searchStringForProducts = ""
			})
	};

	/**
	 * Is called when click "cross" in search panel (for products)
	 */
	this.clearSearchInputProducts = function () {

		model
		.onloadProducts(storeID)
			.then(dataOfProducts => {
					view.renderProductTable(dataOfProducts)
					that.getCurrentStore()
					view.clearSearchInput($productsSearchInput, $btnCrossProducts, $btnRefreshProducts)
			})		
	};

}

(new Controller(new View(), new Model())).init();
