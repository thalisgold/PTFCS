"use strict"

var searchButton = document.getElementById('searchButton');

let tourNames = tours.map(function (data) {
    return data.name;
});
console.log(tourNames);

// autocomplete
$("#tours").autocomplete({
        minLength: 1, // start after 1 character
        source: tourNames, // take the poinames as source
        select: function (event, ui) {
            this.value = ui.item.value // update the value of the current field with the value of the selected element

            return false // see https://css-tricks.com/return-false-and-prevent-default/
        }
})


/**
 * The function takes the value of the search-input(#tours)-field.
 * - If the input value is one of the tourNames the right tour is filtered and the tablerows color is changed for 5 seconds.
 * In addition the checkbox of the tour gets checked and the event-listener that listens to the change of checkboxes is executed.
 * The value of the search-input is set back to ''.
 * - If the input value is not included in tourNames an alert is thrown and the value of the search-input is set back to ''.
 * 
 */
function clickSearch() {
    var searchInput = document.getElementById('tours').value;

    if (tourNames.includes(searchInput)) {
        
        let details = tours.filter(function(el){
            return el.name === searchInput;
        })

        var tablerow = document.getElementById(details[0]._id).parentNode.parentNode;
        console.log(tablerow);
        changeBackgroundColor(tablerow);

        document.getElementById(details[0]._id).click();

        setTimeout(function() {document.getElementById('tours').value = ''}, 100);
    }
    else {
        alert('Keine Tour mit diesem Namen gefunden');
        document.getElementById('tours').value = ''
    }
    
}

/**
 * The function changes the background-color of the given html-element for 5 seconds.
 * 
 * @param {html-element} htmlElem
 */
 function changeBackgroundColor(htmlElem) {
    var currentColor = htmlElem.style.background;
    console.log(currentColor);
    htmlElem.style.background = 'cornflowerblue';
    setTimeout(function(){htmlElem.style.backgroundColor = currentColor}, 5000)
}