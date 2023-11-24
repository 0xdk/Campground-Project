mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v11', // stylesheet location
  // center: [12.550343, 55.665957], // starting position [lng, lat]
  center: camp.geometry.coordinates, // starting position [lng, lat]
  zoom: 10, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
  .setLngLat(camp.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h5> ${camp.title} </h5> <p>${camp.location}</p>`
    )
  )
  .addTo(map);
