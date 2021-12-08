const chai = window.chai
const expect = chai.expect // https://www.chaijs.com/

describe ("test extractCoordinatesLatLngPolygon()-function", () => 
{
    var coordsObjArray =    [
                                {
                                    "lat": 51.95823138578604,
                                    "lng": 7.621893882751466
                                },
                                {
                                    "lat": 51.956830656430135,
                                    "lng": 7.624726295471192
                                },
                                {
                                    "lat": 51.95883923585214,
                                    "lng": 7.628245353698731
                                },
                                {
                                    "lat": 51.95986991930243,
                                    "lng": 7.6242971420288095
                                }
                            ];

    var coordsArrayArray =  [
                                [51.95823138578604, 7.621893882751466],
                                [51.956830656430135, 7.624726295471192],
                                [51.95883923585214, 7.628245353698731],
                                [51.95986991930243, 7.6242971420288095],
                                [51.95823138578604, 7.621893882751466]
                            ];

    console.log(extractCoordinatesLatLngPolygon(coordsObjArray));

    it ("should build an array of coordinate arrays", () => 
    {
        expect(extractCoordinatesLatLngPolygon(coordsObjArray)).to.deep.equal(coordsArrayArray);
    })
})


describe ("test extractCoordinatesLngLatPolygonString()-function", () => 
{
    var coordsObjArray =    [
                                {
                                    "lat": 51.95823138578604,
                                    "lng": 7.621893882751466
                                },
                                {
                                    "lat": 51.956830656430135,
                                    "lng": 7.624726295471192
                                },
                                {
                                    "lat": 51.95883923585214,
                                    "lng": 7.628245353698731
                                },
                                {
                                    "lat": 51.95986991930243,
                                    "lng": 7.6242971420288095
                                }
                            ];

    var coordsArrayArrayString =  "[[[7.621893882751466, 51.95823138578604],[7.624726295471192, 51.956830656430135],[7.628245353698731, 51.95883923585214],[7.6242971420288095, 51.95986991930243],[7.621893882751466, 51.95823138578604]]]";

    // console.log(extractCoordinatesLatLngPolygon(coordsObjArray));

    it ("should build an array of coordinate arrays as string with lat/lng switched to lng/lat", () => 
    {
        expect(extractCoordinatesLngLatPolygonString(coordsObjArray)).to.deep.equal(coordsArrayArrayString);
    })
})


describe ("test getSightNameFromURL()-function", () =>
{
    var wikiUrlString = 'https://de.wikipedia.org/wiki/TESTESTEST'

    it ("should be the last part of the given wikipedia URL", () => 
    {
        expect(getSightNameFromURL(wikiUrlString)).to.deep.equal('TESTESTEST');
    })
})