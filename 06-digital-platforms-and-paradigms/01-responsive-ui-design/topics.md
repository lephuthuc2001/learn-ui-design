
    [1:25] What changes across devices?
        Screen width
        Screen height (largely irrelevant)
        Hover states
        Target sizes
    [5:20] Creating a responsive plan
        Where does space get added/subtracted?
        Where do major layout changes (breakpoints) occur?
        What states apply only to certain screen sizes?
    [12:08] The 3 tenets of good responsive design
        The content determines the breakpoints
        Translate conceptually, not literally
        Mobile first (or, generally: hardest first)
    General Patterns
        [20:08] Rows-to-columns - As screen sizes shrink, change horizontal layouts to vertical
        [22:14] Hide - add less important content to its own page or modal
        [23:01] Drop - push the less important content down
        [24:25] Remove - remove the least important content for small screens
    Navigation Patterns
        [37:54] Menu hidden behind buttons - Hide the menu behind a button tap
        [38:20] Off-canvas effect -
        [39:01] Prioritized items - Show only the most important menu items, putting the rest in a toggleable menu
        [40:35] Footer anchor - Nav link should go to the bottom of the page (i.e. the footer), where you find the same nav content
        Stacked nav - Turn horizontal navigation vertical on mobile
    [43:05] Container Patterns
        Infinite-Width Container - 100% of screen width, forever
        Max-Width Container - 100% of screen width, up to a certain point
        Snap-Width Container - Snaps to a small number of fixed widths depending on screen size
    Sidebar patterns
        [49:36] Drop the sidebar -
        [50:36] Hide in top nav -
    Text patterns
        [57:20] Font sizes are (ultimately) about angular sizes
        [59:06] Ideal text line length is 50-75 characters
        [1:00:48] Remove extra words
        Responsive footnotes
    Table patterns
        [1:02:20] Row-to-mini-table - Change each cell and its respective header cell to a key-value pair
        [1:03:36] Remove least important rows - Make least important columns hidden by default on small screens
        [1:04:40] Flip the axis / horizontal scrolling - For tables that wider than thinner, flip their axis for mobile devices
        [1:06:00] Custom reformat as a list - Create a completely different mobile list display of the same information
    Grids/Lists pattern
        [1:18:10] Flexible width, flexible count - Grids on wide-screens can transition nicely to lists on small screens
        [1:19:30] Collapsible list items - Show lists as collapsed-by-default on mobile so users can quickly browse the high-level elements
    Photography/Imagery Patterns
        [1:20:39] Media object - When you display text/headlines with images, you can alternate between side-by-side and top-and-bottom layouts as needed
        [1:22:15] “Art direction” - Image substantially changes at different screen width, but represents the same feel or vibe
        [1:24:08] Labels above images - Don't force mobile users to scroll by a tall image in order to read the associated headline – if the text is important, put it above the image
    Form patterns
        [1:25:44] Side labels to top labels - Labels that appear to the left of input elements can move above them to save space on mobile
        [1:26:18] Multi-column to single column - On wider screens, forms can be split into multiple columns
        [1:26:56] Sub-element resizing - Text input font size should be 16px minimum; buttons and tappable mobile targets should be 44x44px minimum
