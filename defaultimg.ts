let imageBytes = [-119, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 64, 0,
    0, 0, 64, 8, 3, 0, 0, 0, -99, -73, -127, -20, 0, 0, 0, 4, 103, 65, 77, 65, 0, 0, -79, -113, 11, -4, 97,
    5, 0, 0, 0, 1, 115, 82, 71, 66, 0, -82, -50, 28, -23, 0, 0, 0, -64, 80, 76, 84, 69, 8, -111, -23, -124,
    -46, -1, -127, -50, -3, -125, -48, -1, 125, -52, -3, -123, -44, -1, 127, -50, -3, -1, -1, -1, -126, -50,
    -4, -121, -41, -1, -124, -49, -3, 13, -109, -22, 9, -111, -23, -116, -46, -4, 23, -103, -20, -121, -47,
    -3, 0, -116, -24, 107, -60, -6, 29, -100, -19, 114, -58, -6, 18, -106, -21, -125, -48, -2, 95, -67, -9,
    -105, -42, -4, -3, -2, -1, -48, -20, -3, 120, -54, -5, 41, -95, -18, -12, -5, -1, 81, -74, -11, -7, -3,
    -1, -95, -38, -3, -90, -37, -5, 35, -97, -18, 67, -81, -13, -126, -49, -3, 46, -92, -17, 90, -71, -11,
    -18, -8, -1, 5, -112, -23, 78, -77, -13, -71, -29, -3, -111, -44, -3, 123, -53, -4, 58, -86, -15, 51,
    -90, -17, 101, -66, -10, -36, -15, -2, -64, -26, -3, -81, -32, -3, 72, -79, -13, 55, -87, -15, -24,
    -11, -2, 58, -81, -5, 62, -83, -14, 65, -83, -15, -41, -17, -2, -58, -24, -3, -78, -33, -5, 118, -62,
    -12, -29, -13, -3, -115, -50, -9, -122, -55, -12, 42, -89, -7, 28, 71, -109, -109, 0, 0, 3, 94, 73, 68,
    65, 84, 88, -61, -19, 87, 91, 123, -94, 48, 16, 37, -102, -124, 112, -111, 59, 40, -32, 5, 11, 10, -118,
    -73, -74, -82, 90, -37, -18, -2, -1, 127, -75, -127, -86, 107, 77, 92, -30, -21, 126, 123, 30, -115, -25, 56, 57,
    51, -103, 25, 37, -23, 63, -2, -29, 31, -121, 110, -60, -117, -119, 11, -95, 27, 44, 98, 67, 127, -108, -83, -59,
    -123, 93, 2, 5, -7, -124, -8, 72, 1, -91, 61, -56, -76, 7, -24, -34, -50, -10, 107, -14, 25, 84, 4, -71, 47, -122,
    -24, -81, -17, 92, 5, -75, -56, 45, -128, 82, 62, 9, 69, 49, 94, 41, -128, 112, 1, 20, 123, -36, -52, 95, 98, -123,
    -36, 5, -62, -81, 77, -4, 39, 0, -56, 95, 0, -64, -66, -127, 127, 109, 29, 15, 62, -38, -3, -115, -65, 64, 41, 105,
    -128, -17, 103, -9, -7, 113, -22, -109, 70, -128, -24, 110, 58, 61, 23, 17, 1, 40, -63, -67, -70, 28, 40, 34, 124,
    -46, 66, 119, 82, 49, 38, -75, 1, 16, -30, 59, 76, 124, 58, 2, 46, -65, -96, 38, 85, 0, 88, 77, -114, 35, 62, 31,
    -50, -97, -97, -25, -75, -126, -78, -32, -15, 29, 88, 57, 104, 30, 100, 89, 14, -71, -4, -47, 80, -106, -5, 9, -84,
    -22, -55, -26, -123, -80, -81, 2, -128, 51, -7, 88, 76, -62, 25, 100, 5, 58, 31, 63, -117, -9, -2, -44, -84, 92, 0,
    49, -25, -7, -81, -22, 20, 76, 55, -110, 21, 127, 76, 85, 54, -128, -39, -54, -78, -34, -121, 114, 29, -126, 50, -32,
    -28, -80, -92, 55, -64, 115, 121, 98, -27, -53, -11, -90, -53, 24, -87, 38, -102, 100, -3, 60, 76, 55, -107, 0, -80,
    -39, 76, -114, 43, 7, 90, -35, 97, -106, -21, -71, 22, -113, 24, -127, -7, -69, -91, -21, -70, 118, 60, 84, 2, 126,
    -55, 22, -45, -94, -50, -63, 104, -22, -28, -70, -98, 123, 93, -26, 10, -35, -126, 10, 72, 86, 119, 93, -37, -61, 49,
    -31, -91, 22, 48, -41, 75, 43, -105, 114, -19, 76, 51, 77, -13, 100, 71, 103, 111, 73, 82, 110, 37, -57, -78, 78, -28,
    43, -73, 12, 97, 103, -76, -103, -19, 61, -55, 43, -66, -82, 109, 70, -63, 96, -30, 126, 73, -88, -10, 88, -41, -30,
    -49, 48, -103, 99, 122, 61, -27, -119, 91, 70, -101, 62, 45, -126, 94, -104, 116, 72, 68, 84, -107, -72, 123, 47, -73,
    44, -19, -43, 77, 85, 85, -123, 100, -98, -124, -43, -7, 48, -20, 96, -94, -68, 48, 2, 1, -62, 111, -14, 9, -61, -11,
    103, -80, 90, 77, -76, -36, 48, 60, -61, -77, -116, 96, 101, 7, -97, -21, -31, -7, -8, -61, 36, 74, -63, -42, 33, 30,
    -11, -28, 63, -40, -66, -123, -45, -107, -10, -125, -30, -105, -105, 108, 103, -57, -16, -6, -16, 13, -6, -82, -57,
    -44, 33, 12, -27, 91, 36, 3, 42, -80, 98, 63, -17, 119, 8, -54, 24, 11, -52, 41, -13, 69, -71, -9, 113, -40, -54, 28,
    -116, 48, -29, -30, 4, -51, -121, -78, 48, -98, 33, -29, 98, -127, -70, -113, 9, -36, -66, -24, -41, -121, 34, 24, 97,
    127, -52, 100, -127, -25, -63, 29, 12, -25, 126, 116, -101, 5, -35, 110, -121, -62, 2, 107, -84, 76, 56, 35, -27, 91,
    29, 52, 88, -128, -106, -100, -114, -122, 15, -126, -4, -87, -55, -42, 81, 85, -53, 64, 52, 15, 51, -56, -21, 72, -12,
    61, -61, 55, 33, 126, -65, -125, 57, -81, 89, -54, 34, 31, -117, -123, 16, 66, -30, -69, -52, -94, -80, 79, -85, -79,
    -66, 21, -77, -112, 54, 118, 120, -29, -30, 75, 61, -42, -95, 72, 38, 123, 117, -61, 5, -19, 111, -91, -8, -92, 124,
    77, -75, -115, -104, 5, -11, -104, 7, 87, 49, 100, 32, 61, -11, 126, 33, -127, -45, -104, -57, 23, 31, -116, 8, -112,
    -57, 5, -82, 6, -36, 101, -84, -105, 15, 9, 92, 58, -21, 56, 61, -17, 53, -16, -7, 33, -127, -45, 120, -47, -125, -53,
    94, -126, 19, -95, 66, -2, -77, -85, 20, -41, 1, -76, -38, 116, -126, 11, 8, 108, -23, 119, -37, -41, 33, -100, 28,
    -16, 65, -108, -30, 110, 79, -28, 45, 19, 18, -99, -74, -71, -54, 5, 47, -86, 55, 51, -32, -17, 98, -97, 116, -6, -51,
    2, -76, -89, -105, 78, -127, -38, -25, 68, 44, 107, 7, -108, 40, -109, -116, 50, 85, -73, 34, -107, 92, -19, 72, 59,
    92, -15, -46, -44, -111, 92, 64, 82, -124, 2, -121, 110, -23, 46, -128, 7, -111, 74, 70, 65, 101, -99, -83, -48, 123,
    -48, -34, 58, -64, 8, -37, 75, -3, 107, -70, 9, -44, -14, -10, 108, 62, -3, 87, 64, -105, 111, 58, -26, -99, -52, -47,
    47, 29, -95, 57, 13, 116, 67, 57, 119, 3, -51, -55, -66, -17, 25, 25, 106, 118, 113, -40, -59, 105, -53, -71, 34, -3,
    6, 71, 84, 119, -92, 72, -109, -15, -121, 0, 0, 0, 0, 73, 69, 78, 68, -82, 66, 96, -126];
export default imageBytes