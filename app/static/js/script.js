
/*
==================================================================
    Menu Animation
==================================================================
*/

// Animation to change the height of the navbar and change the logo image
function menuAnimation() {

    // constructing a new url was necessary for setting the logo ..

    const logo = document.querySelector('#logo');
    const url = window.location.protocol + '//' + window.location.host + '/';

    window.addEventListener('scroll', () => {

        if (window.pageYOffset  >  0 ) {
            logo.style.width = '80px';
            logo.style.height = '60px';
            logo.src = `${url}static/images/logo_small_white.png`;
            changeDropDown('0');
        }
        else {
            logo.style.width = '120px';
            logo.style.height = '109px';
            logo.src = `${url}static/images/logo_large_white.png`;
            changeDropDown('15');
        }
    });
}
menuAnimation();

// As menu height changes, so does the dropdown menu offset
function changeDropDown(offset) {    
    const menus = document.querySelectorAll('.main-dropdown-menu');
    menus.forEach(menu => menu.setAttribute('uk-drop', `offset: ${offset}`));
}


/*
==================================================================
    XMLHTTPRequest fort Comments
==================================================================
*/

// To prevent page refesh after a comment has been posted
function listenForComments() {

    // if on a page with the comments form
    if (document.querySelector('#comments-form')) {

        const form = document.querySelector('#comments-form');
        const userComments = document.querySelector('#user-comments');
        const placeholder = document.querySelector('#comments-placeholder');
        const data = document.querySelector('#hidden-input');
        const reply = document.querySelector('#form-reply-comment');
        
        // listener for submit
        form.addEventListener('submit', (event) => {
            
            event.preventDefault()
            const date = new Date().toLocaleString();

            // send off a xhr request, when response received, add html comment with data
            let xhr = new XMLHttpRequest();
            xhr.open("POST", '/comments', true);
            xhr.onreadystatechange = function() {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {

                    // comment html (unformatted)
                    const comment =
                    `<article class="uk-comment uk-padding-small uk-margin-medium"><header class="uk-comment-header uk-grid-medium uk-flex-middle" uk-grid>
                    <div class="uk-width-auto"><img class="uk-comment-avatar" src="../../static/images/profile_picture.png" width="80" height="80" alt="profile picture"></div>
                    <div class="uk-width-expand"><h4 class="uk-comment-title uk-margin-remove">${data.value}</h4><div class="uk-comment-meta">
                    <a href="{{ url_for('recipe', recipe=${recipeId}, title=comment.title|resub)}}">${recipeTitle}</a>
                    </div><ul class="uk-comment-meta uk-subnav uk-subnav-divider uk-margin-remove-top">
                    <li>${date}</li></ul></div></header><div class="uk-comment-body"><p class="comment">${reply.value}</p></div></article>`;
                    
                    // insert at bottom of comments and reset comments form value
                    if (placeholder) placeholder.style.display = 'none';
                    userComments.insertAdjacentHTML("beforeend", comment);
                    reply.value = '';
                }
            };

            // set correct headers and send xhr data to backend
            xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
            xhr.send(`_id=${recipeId}&title=${recipeTitle}&username=${data.value}&date=${date}&reply=${reply.value}`); 
        });
    }
}
listenForComments();


/*
==================================================================
   Like / Dislike XHR Function
==================================================================
*/

function listenForFavourites() {

   const favourites = document.querySelectorAll('.favourites');
   const userLoggedIn = document.querySelector('#uli').dataset.value;
   
   // add event listener to each like / dislike button
   favourites.forEach(favourite => favourite.addEventListener('click', event => {

        // if the user is not logged in - do not continue 
        if (userLoggedIn == 'false') return promptToLogin();

        // get clicked element values
        let [_id, opinion, value] = event.currentTarget.dataset.values.split(',');

        // like and dislike are both svg elements and listing for the event bubble is ..
        // .. the most efficent way to capture the click, changing the node values ensures that ..
        // .. any other nodes are not overwrittn with updated values
        favourites.forEach(item => {
            let [itemId, itemOpinion, itemValue] = item.dataset.values.split(',');
            let text = item.childNodes[0];
            let num = parseInt(text.textContent);
            
            // if we have the correct recipe
            if (_id == itemId) {

                // if opinion is the same 
                if (itemOpinion == opinion) {
                       
                        // if were are removing a opinion
                        if (itemValue == 'true') {
                            item.classList.remove('user-favourite');
                            item.dataset.values = `${itemId},${itemOpinion},false`;
                            text.textContent = `${num - 1} `;
                            updateFavourites(itemId, itemOpinion, false);
                        }
                        // if we are adding an opinion
                        else {
                            item.classList.add('user-favourite');
                            item.dataset.values = `${itemId},${itemOpinion},true`;
                            text.textContent = `${num + 1} `;
                            updateFavourites(itemId, itemOpinion, true);                        
                        }
                }

                // you cannot like and dislike a recipe at the same time
                // remove the opossing opinion
                if (itemOpinion != opinion) {
                    if (itemValue == 'true') {
                        item.classList.remove('user-favourite');
                        item.dataset.values = `${itemId},${itemOpinion},false`;
                        text.textContent = `${num - 1} `;
                        updateFavourites(itemId, itemOpinion, false);
                    }
                }
            };
        });
   }));
};
listenForFavourites();


/*
==================================================================
   Update Favourites
==================================================================
*/

// sends a lxhr request to backend to add or remove a like or dislike
function updateFavourites(recipe_id, opinion, value) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", '/update_favourites', true);
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
    xhr.send(`_id=${recipe_id}&opinion=${opinion}&value=${value}`); 
}


/*
==================================================================
   Login Prompts
==================================================================
*/

// if the user is not logged  shows a notification
function promptToLogin() {
    UIkit.notification({
        message: `You must be signed in to do that!`,
        status: 'primary',
        pos: 'top-right',
        timeout: 3000
    });
}


/*
==================================================================
   Add Inputs to Editor Form
==================================================================
*/

//  creates additional input element in editor group
function addEditorInput(category) {
    if (category == 'instruction') {
        const instructions = document.querySelector('#instructions');
        const length = document.querySelectorAll('#instructions input').length;
        const div = document.createElement('div');
        div.className = 'uk-width-1-2@s';
        const label = document.createElement('label');
        label.className = 'uk-form-label'
        label.innerText = `No. ${length + 1}`;
        const input = document.createElement('input');
        input.className = 'uk-input';
        input.type = 'textarea';
        input.name = `instruction-${length + 1}">`
        div.append(label);
        div.append(input);
        instructions.appendChild(div);
    }
    else {
        const ingredients = document.querySelector('#ingredients');
        const length = document.querySelectorAll('#ingredients input').length;
        const input = document.createElement('input');
        input.className = 'uk-input';
        input.type = 'textarea';
        input.name = `ingredient-${length + 1}">`
        ingredients.appendChild(input);
    }
}

/*
==================================================================
   Remove Inputs to Editor Form
==================================================================
*/

// removes last input element in editor group
function removeEditorInput(category) {
    if (category == 'instruction') {
        const instructions = document.querySelector('#instructions');
        const length = document.querySelectorAll('#instructions input').length;
        if (length > 1)  instructions.removeChild(instructions.lastElementChild);
    }
    else {
        const ingredients = document.querySelector('#ingredients');
        const length = document.querySelectorAll('#ingredients input').length;
        if (length > 1)  ingredients.removeChild(ingredients.lastElementChild);
    }
}


/*
==================================================================
   Profile Page Show / Hide Recipes
==================================================================
*/

// javascript pagination function to show or hide recipes on the users profile page
function showHideUserRecipes() {
    if (document.querySelector('#show-more-recipes')) {
        const buttonMore = document.querySelector('#show-more-recipes');    
        const buttonLess = document.querySelector('#show-less-recipes');    
        
        let start = 1;
        showHideRecipes(start);

        // increase recipes
        buttonMore.onclick = () => {
            start += 1;
            showHideRecipes(start);
        }

        // decrease recipes
        buttonLess.onclick = () => {
            start -= 1;
            showHideRecipes(start);
        }
   
        function showHideRecipes() {
            const recipes = document.querySelectorAll('.recipe-card ');
            
            //  on page load, 8 recipes can be show 
            // increasing or decreasing insteps of 4
            if (start == 1) step = 8;
            else step = (8 * start) - 4;
        
            // iterate over recipes are set display values
            for (let i = 0; i < recipes.length; i++) {
                if (i < step) recipes[i].style.display = 'block';
                else recipes[i].style.display = 'none';
            }
            
            // shows / hides more recipes button
            if (recipes[recipes.length - 1].style.display == 'block') buttonMore.style.display = 'none';
            else buttonMore.style.display = 'inline-block';

            // shows / hides less recipes button
            if (start > 1) buttonLess.style.display = 'inline-block';
            else buttonLess.style.display = 'none';
        }
    }
}
showHideUserRecipes();


/*
==================================================================
   Event Listeners
==================================================================
*/

function eventListeners() {
   
    // File Edit Button
    document.querySelectorAll('.userNotLoggedIn').forEach(item => item.addEventListener('click', () => promptToLogin()));

    // Only set event listeners on editor page
    if (window.location.href.includes('editor')) {
        document.querySelector('#add-instruction').onclick = () => addEditorInput('instruction');
        document.querySelector('#add-ingredient').onclick = () => addEditorInput('ingredient');
        document.querySelector('#remove-instruction').onclick = () => removeEditorInput('instruction');
        document.querySelector('#remove-ingredient').onclick = () => removeEditorInput('ingredient');
    }
}
eventListeners();

