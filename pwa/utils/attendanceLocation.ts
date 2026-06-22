const EARTH_RADIUS_METERS = 6371000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceMeters(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
) {
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const originLatitude = toRadians(fromLatitude);
  const targetLatitude = toRadians(toLatitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(targetLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function isWithinAttendanceRange(
  currentLatitude: number,
  currentLongitude: number,
  targetLatitude: number,
  targetLongitude: number,
  radiusMeters: number,
) {
  return (
    calculateDistanceMeters(
      currentLatitude,
      currentLongitude,
      targetLatitude,
      targetLongitude,
    ) <= radiusMeters
  );
}
