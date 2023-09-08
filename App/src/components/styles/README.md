## ADVANCED SELECTOR:

- The universal selector: '_'
  The universal selector '_' selects all tags without exception.

```css
* {
  /* Insert your style here */
}
```

- Selector for a tag within another: A B
  Let's take an example with this code written in the HTML file:

```
<h3>Title with <em>important text</em></h3>
```

In CSS, you would write:

```css
h3 em {
  /* Insert your style here */
}
```

This piece of code means in English:

> _"Apply this style to all `<em>` tags located inside an `<h3>` tag."_

- Selector for a tag that follows another: A + B
  In CSS, you would write, for example:

```css
h3 + p {
  /* Insert your style here */
}
```

This will select the first `<p>` tag located after an `<h3>` title.

- Selector for a tag with an attribute: `a[attribute]`

```css
a[title] {
  /* Insert your style here */
}
```

In English, this piece of code means:

> _"Select all hyperlink `<a>` tags that have a 'title' attribute."_

Example of associated HTML code:

```html
<a href="http://site.com" title="Tooltip"></a>
```

- There are variations of this selector form: `a[attribute="Value"]`

A tag with an attribute and an exact value, like:

```css
a[title="Click here"] {
  /* Insert your style here */
}
```

It's the same thing, but the attribute must also have the exact value "Click here."

Example of associated HTML code:

```html
<a href="http://site.com" title="Click here"></a>
```

`a[attribute*="Value"]`: A tag, an attribute, and a value, like:

```css
a[title*="here"] {
  /* Insert your style here */
}
```

Similarly, the attribute must contain the word "here" in its value (no matter its position).

Example of associated HTML code:

```html
<a href="http://site.com" title="Somewhere around here"></a>
```

## FLEXBOX:

Flexbox allows you to arrange these elements in any direction you want.
With flex-direction, you can position them vertically or even reverse their order.

- This CSS property can take the following values:

  `row` : organized in a row (default);

  `column` : organized in a column;

  `row-reverse` : organized in a row, but in reverse order;

  `column-reverse` : organized in a column, but in reverse order.

Elements are organized horizontally by default.
However, they can be arranged vertically.

Depending on your choice, this determines what is called the main axis. There is also a secondary axis:

    If your elements are organized horizontally, the secondary axis is the vertical axis;
    If your elements are organized vertically, the secondary axis is the horizontal axis.

- The principle of Flexbox is to have a container with multiple elements inside.

With `display: flex;` on the container, the elements inside are arranged in Flexbox mode **(horizontally, by default)**.

- Flexbox can handle all directions :

With `flex-direction`, you can specify whether the elements are arranged horizontally (default) or vertically.
This defines the main axis.

1. Alignment of elements is done on the main axis with `justify-content` and on the secondary axis with `align-items`.

2. With `flex-wrap`, you can allow elements to wrap onto the next line if they run out of space.

3. If there are multiple lines, you can specify how the lines should distribute themselves with `align-content`.

Useful webiste : [Flexbox Froggy](https://flexboxfroggy.com/).

## CSS GRID:

CSS Grids complement Flexbox and allow for the creation of more complex layouts than Flexbox, without requiring elements of the same size.
Html code example :

```
<div class="container">
  <div class="box une">🐸 Élément 1</div>
  <div class="box deux">🦊 Élément 2</div>
  <div class="box trois">🦄 Élément 3</div>
  <div class="box quatre">🐶 Élément 4</div>
  <div class="box cinq">🐨 Élément 5</div>
  <div class="box six">🐒 Élément 6</div>
  <div class="box sept">🦆 Élément 7</div>
  <div class="box huit">🐙 Élément 8</div>
</div>
```

To declare a grid, simply use `display: grid;` on the container.

Your browser will understand that the elements are within the grid.

- Columns are defined with `grid-template-columns`, and rows are defined with `grid-template-rows`.

  > (based on the number of values passed, new columns and rows are created).

- In addition to the usual units like `px, em, rem`, and `%, fr` units are even simpler and allow you to specify a fraction of the grid.

- `gap` is used to space elements between each other.

Useful webiste : [Grid Garden](https://codepip.com/games/grid-garden/#fr).
