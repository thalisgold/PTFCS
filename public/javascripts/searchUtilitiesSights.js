"use strict"

// html-element
var searchButton = document.getElementById('searchButton');

// variable that stores all sight names in an array
let sightNames = sights.map(function (data) {
    return data.features[0].properties.Name;
});
//console.log(sightNames);

/**
 * function that uses the all the sight names for autocompletion of the searchbar.
 * Autocomplete start after 1 character. Source: sightNames-array.
 * 
 */
$("#sights").autocomplete({
        minLength: 1, // start after 1 character
        source: sightNames, // take the poinames as source
        select: function (event, ui) {
            this.value = ui.item.value // update the value of the current field with the value of the selected element

            return false // see https://css-tricks.com/return-false-and-prevent-default/
        }
})


/**
 * The function takes the value of the search-input(#sights)-field.
 * If the input value is one of the sightNames the right sight is filtered and the tablerows color is changed for 5 seconds.
 * In addition the associated marker-popup is opened and the value of the search-input is set back to ''.
 * If the input value is not included in sightNames an alert is thrown and the value of the search-input is set back to ''.
 * 
 */
function clickSearch() {
    var searchInput = document.getElementById('sights').value;
    //console.log(searchInput);
    if (sightNames.includes(searchInput)) {
        let details = sights.filter(function(el){
            return el.features[0].properties.Name === searchInput;
        })

        
        var tablerow = document.getElementById(details[0]._id).parentNode.parentNode;
        console.log(tablerow);
        changeBackgroundColor(tablerow);

        markerFunctionOpen(details[0]._id);
        setTimeout(function() {document.getElementById('sights').value = ''}, 100);
    }
    else {
        alert('Keine Sehenswüdigkeit mit diesem Namen gefunden');
        document.getElementById('sights').value = ''
    }
    
}


/**
 * The function changes the background-color of the given tablerow for 5 seconds.
 * 
 * @param {html-element} tablerow 
 */
function changeBackgroundColor(tablerow) {
    var currentColor = tablerow.style.background;
    console.log(currentColor);
    tablerow.style.background = 'cornflowerblue';
    setTimeout(function(){tablerow.style.backgroundColor = currentColor}, 5000)
}