"use strict"

// arrays to store temporal tour-data
var checkboxTourArray = [];
var checkboxTourArrayNames = []

// html-elements
var tableTours = document.getElementById('tableTours');
var erstelleTour = document.getElementById('erstelleTour');


/**
 * Function that listens to a change event on every html-element with class='chb'. The meant elements are checkboxes which create a temporal tour when checked.
 * When a sight is checked a table is created which lists all the sights in the order they were checked. In adition the 'erstelleTour'-form gets displayed
 * which the client can use to create the temporal displayed tour constantly.
 * 
 */
$(".chb").each(function() {

        $(this).change(function() {

                $(this).attr('checked',true);
                $(".chb").attr('checked',false);
                if (this.checked) {
                    checkboxTourArray.push(this.id);                                        // push the given element into the array
                    checkboxTourArrayNames.push(this.parentNode.nextSibling.innerHTML);     // push the given element into the array
                }
                else {
                    const index = checkboxTourArray.indexOf(this.id);   // search the index we need for removing the right element
                    if (index > -1) {
                        checkboxTourArray.splice(index, 1);         // remove 1 element at the given index
                        checkboxTourArrayNames.splice(index, 1);    // remove 1 element at the given index
                    }
                }

                if (checkboxTourArrayNames.length > 0) {                                                // create and display the temporal html-table if a box was checked
                    var tourTableArray = '<tr><th>Position</th><th>Sehenswürdigkeiten</th></tr>' 
                    for (let i = 0; i < checkboxTourArrayNames.length; i++) {
                        tourTableArray += `<tr>\
                                            <td>${i+1}</td>\
                                            <td>${checkboxTourArrayNames[i]}</td>\
                                            </tr>`
                    }

                    tableTours.innerHTML = tourTableArray;
                    tableTours.style.display = 'table';
                    erstelleTour.style.display = 'block';

                }
                else {                                          // undisplay the temporal html-table when all boxes are unchecked
                    tableTours.style.display = 'none';
                    erstelleTour.style.display = 'none';
                }
                
                // console.log(checkboxTourArray);
                // console.log(checkboxTourArrayNames);

        });
});


// html-object
var tourButton = document.getElementById('erstelleTourButton');


/**
 * Event-Listener that listens to a click event on the tourButton.
 * If the button is clicked, the callback function is executed which creates a tour-object that holds the tour name and an array
 * with the ids of the sights in the tour. The object is send to the '/edit/addTour'-route, where the right sights are searched together on the server side
 * with the ids stored in the object. After that the tour object gets uploaded to the database. (More information in the '2_edit.js'-route.)
 * 
 */
tourButton.addEventListener('click', function(){
    var tourObj = {}
    tourObj.items = checkboxTourArray;
    tourObj.name = document.getElementById('tourName').value;
    var tourObjString = JSON.stringify(tourObj)
    
    console.log(tourObj);

     // Ajax request to send sight data to server to upload it to the database
     $.ajax({
        async: "true",
        type: "POST",
        url: "/edit/addTour",
        data: {
            o: tourObjString
        },
        success: function (data) {
            alert("Die Tour wurde erfolgreich hinzugefügt und ist unter 'Stadttouren' einsehbar.")
            window.location.href = "/edit";
        },
        error: function () {
            alert('error')
        }
    })
    .done()
})