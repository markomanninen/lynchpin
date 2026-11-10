# Lynchpin Geometry in Three and Four Dimensions

The Lynchpin is a figure of six regular pentagons that share one corner at the centre of a regular tetrahedron. Terrence Howard described it on the Joe Rogan Experience #2171. This project shows why the six pentagons leave a gap in three dimensions and where they close. They close exactly in four dimensions, as the four edges and six pentagons at one vertex of the 120-cell. The 120-cell is a regular polytope, the four-dimensional counterpart of a regular solid.

The project has three parts:

- an interactive model at [markomanninen.github.io/lynchpin](https://markomanninen.github.io/lynchpin/)
- a paper as [PDF](https://markomanninen.github.io/lynchpin/lynchpin.pdf) and [LaTeX](lynchpin.tex)
- test scripts that check the identities and numerical values of the paper

## The figure and its discrepancy

Four rays run from the centre of a regular tetrahedron to its four vertices. Any two of the rays enclose the angle arccos(−1/3) ≈ 109.47°. The Lynchpin places one regular pentagon between each of the six pairs of rays, with one corner at the centre and two sides pointing as nearly as possible along the two rays. The corner of a regular pentagon is 108°, which is 1.47° less than the angle between the rays. This difference is called the discrepancy. The two sides of the pentagon miss the rays because of it, each by 0.74° when the pentagon is centred between them.

Each ray belongs to three pairs, so three pentagon sides lie next to every ray. In a closed figure they would lie on the ray and join the three pentagons to each other. In three dimensions they stay apart.

## The result

A closed figure needs four rays of which every two enclose 108°. Four rays in three-dimensional space can enclose six equal angles only at 109.47°, and the paper proves this with a determinant. Four rays of which every two enclose 108° are linearly independent. Three-dimensional space has room for only three independent directions, so such rays need a fourth dimension. When each ray of the tetrahedron is tilted by 7.76° towards a fourth axis, every two rays enclose exactly 108°, and all six pentagons join along the rays.

The closed figure is a known one. The 120-cell has 600 vertices, and four edges and six regular pentagons meet at each of them, every two edges at 108°. The Lynchpin of three dimensions is this arrangement with the tilt reduced to zero while the pentagons stay regular, and the discrepancy of 1.47° opens on the way.

## The Pythagorean comma

In the same episode Howard and the mathematician Eric Weinstein compared the discrepancy with the Pythagorean comma of music theory. A fifth is the interval between two tones whose frequencies have the ratio 3/2, and an octave is the interval with the ratio 2. The comma is the ratio by which twelve fifths exceed seven octaves, 531441/524288 ≈ 1.0136433. The ratio of the two angles of the Lynchpin is 109.4712/108 ≈ 1.0136224. The two numbers agree to four decimals. The paper proves that the angle ratio is irrational, so it equals neither the comma nor any other ratio of whole numbers.

## The gaps in millimetres

The discrepancy is an angle. The table turns it into three distances, called gaps, for pentagons with a 5 cm side. The far end of a ray is the vertex of the tetrahedron, and the far end of a pentagon side is the pentagon corner next to the shared one.

| Distance | Size |
|---|---|
| Centred pentagon, from the far end of a side to the far end of the ray next to it | 0.64 mm |
| Centred pentagons, between the far ends of two sides next to the same ray | 1.11 mm |
| A single pentagon turned until one side lies on its ray, from the far end of the other side to the far end of its ray | 1.28 mm |

## The interactive model

Open the [model](https://markomanninen.github.io/lynchpin/) and try these controls:

- **Fold into 4D** tilts the rays from 0° to 7.76°. The table under it shows the angle between two rays falling from 109.47° to 108° and the first two gaps of the table above shrinking to zero.
- **Zoom to the far end of a ray** moves the view to the far end of one ray, where the far ends of three pentagon sides stay apart in three dimensions and meet in four.
- **Rotate in 4D** turns the figure towards the fourth axis. The picture is the projection of the turned figure into three dimensions, either with the fourth coordinate dropped or in perspective.
- **Edge steps from the shared corner** draws the 120-cell around the closed figure, from the nearest edges to all 1200.

To run the model locally, serve the folder and open the address that the server prints.

```sh
git clone https://github.com/markomanninen/lynchpin.git
cd lynchpin
python3 -m http.server
```

The file [lynchpin4d.js](lynchpin4d.js) computes every point of the figure and contains no drawing code. The file [index.html](index.html) draws those points with Three.js.

## Tests

```sh
./scripts/run_tests.sh
```

The script runs two sets of tests from the folder [tests/](tests/). The Maxima files check the exact identities and the numbers of the paper, such as the determinants, the tilt angle and the gap table. The Node file builds the 120-cell from its coordinates, counts its edges and pentagons, and tests the functions of [lynchpin4d.js](lynchpin4d.js). Maxima installs with `brew install maxima`, and Node 20 or newer runs the second set. The arguments `maxima` and `node` run one set alone.

Figure 1 (the Lynchpin in three dimensions) and Figure 3 (the 120-cell) of the paper come from `node scripts/make_figure.mjs`, and the paper builds with `pdflatex lynchpin.tex`.

## References

- [Joe Rogan Experience #2171 with Eric Weinstein and Terrence Howard](https://www.youtube.com/watch?v=nrOaFxNex7U)
- [OTOET eBook](https://tcotlc.com/wp-content/uploads/2020/09/OTOET_PREVIEW_055_SEPTEMBER_29_2020.pdf)
- [Terrence Howard's competition](https://www.terryslynchpins.com/welcome-to-now)
- H. S. M. Coxeter, Regular Polytopes, Dover 1973
- J.-F. Sadoc and R. Mosseri, Geometrical Frustration, Cambridge University Press 1999

## License

This project is licensed under the MIT License, see [LICENSE](LICENSE).
