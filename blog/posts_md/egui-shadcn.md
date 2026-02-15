---
title: "egui-shadcn: Beautiful UI Components for Rust"
date: "2026-02-15"
description: "Announcing egui-shadcn, a library that brings shadcn/ui-style components to egui — 55+ widgets with built-in theming, from buttons and inputs to dialogs and date pickers."
publish: true
tags:
  - rust
  - open-source
  - programming
---

### TL;DR

I built [egui-shadcn](https://github.com/pjankiewicz/egui-shadcn), an open-source Rust library that brings [shadcn/ui](https://ui.shadcn.com)-style components to [egui](https://github.com/emilk/egui). It ships 55+ widgets with built-in light and dark theming, 1600+ Lucide icons, and works on desktop, web, and anywhere egui runs.

**[Try the live demo](https://pjankiewicz.github.io/egui-shadcn/)** (runs in your browser via WebAssembly).

### Why?

egui is one of the best immediate-mode GUI libraries out there. It's fast, portable, and the API is delightful. But the default look is... utilitarian. If you want your egui app to look polished — with proper spacing, rounded corners, hover states, focus rings, and a consistent design language — you end up writing a lot of styling code.

Meanwhile, in the web world, [shadcn/ui](https://ui.shadcn.com) solved exactly this problem for React. Beautiful, accessible, composable components that just look right out of the box. I wanted that same experience in Rust.

### What's Inside

The library is a single `egui-shadcn` crate with zero runtime dependencies beyond egui itself (plus `egui_flex` for flexbox layout). Here's the component breakdown:

**Inputs**: Button, Checkbox, Input, InputOtp, Radio, RadioGroup, Select, Slider, Switch, Textarea, Toggle, ToggleGroup, Combobox, DatePicker

**Layout**: Accordion, AspectRatio, Card, Collapsible, Resizable, ScrollArea, Separator, Tabs, Flex

**Overlays**: AlertDialog, Command, ContextMenu, Dialog, Drawer, DropdownMenu, HoverCard, Menubar, NavigationMenu, Popover, Sheet, Tooltip

**Feedback**: Alert, Badge, Progress, Skeleton, Spinner, Toast

**Data**: Avatar, Breadcrumb, Calendar, Carousel, Pagination, Sidebar, Table

**Typography**: Typography, Label, Kbd

**Icons**: 1600+ Lucide icons rendered as vector paths

### Quick Start

```toml
[dependencies]
egui-shadcn = "0.1"
```

```rust
// Set up the theme
let theme = egui_shadcn::theme::shadcn_theme_dark::dark();
egui_shadcn::ShadcnThemeExt::set_shadcn_theme(ctx, theme);

// Use components
egui_shadcn::Button::new("Click me").show(ui);

ui.add(egui_shadcn::Switch::new(&mut value).label("Dark mode"));

ui.add(egui_shadcn::Input::new(&mut text).placeholder("Type here..."));

ui.add(egui_shadcn::Select::new(&mut selected, &options)
    .placeholder("Pick one..."));
```

Each component follows egui conventions — either implement `egui::Widget` for use with `ui.add()`, or provide a `.show(ui)` builder pattern.

### Theming

The library comes with light and dark themes built in. Switching is a single line:

```rust
let theme = if dark_mode {
    egui_shadcn::theme::shadcn_theme_dark::dark()
} else {
    egui_shadcn::theme::shadcn_theme_light::light()
};
egui_shadcn::ShadcnThemeExt::set_shadcn_theme(ctx, theme);
```

The theme covers all components — backgrounds, borders, foreground colors, accent states, destructive variants, muted text, and more. Every color is defined in a single `ShadcnTheme` struct, so creating your own theme is straightforward.

### Flexbox Layout

One thing I missed from web development was proper flexbox. The library wraps `egui_flex` with a simpler API:

```rust
// Row with gap, grow, and justify
egui_shadcn::Flex::row().gap(8.0).w_full().show(ui, |f| {
    f.grow(1.0, egui_shadcn::Input::new(&mut text)
        .placeholder("Type a message..."));
    f.add(egui_shadcn::Button::new("Send"));
});

// Wrapping tags
egui_shadcn::Flex::row().gap(4.0).wrap().show(ui, |f| {
    for tag in &tags {
        f.add(egui_shadcn::Badge::new(*tag));
    }
});
```

### Icons

All 1600+ Lucide icons are embedded as SVG path data and rendered as vector strokes at any size:

```rust
let (rect, _) = ui.allocate_exact_size(
    egui::vec2(24.0, 24.0), egui::Sense::hover()
);
egui_shadcn::paint_icon(
    ui.painter(), rect,
    &egui_shadcn::LucideIcon::Heart,
    theme.foreground,
);
```

Buttons can also take icons directly:

```rust
egui_shadcn::Button::new("Download")
    .icon(egui_shadcn::LucideIcon::Download)
    .show(ui);

egui_shadcn::Button::icon_only(egui_shadcn::LucideIcon::Settings)
    .variant(egui_shadcn::ButtonVariant::Outline)
    .show(ui);
```

### WebAssembly

The whole thing compiles to WebAssembly and runs in the browser. The [live demo](https://pjankiewicz.github.io/egui-shadcn/) is a full interactive showcase of every component — buttons, inputs, dialogs, toasts, calendars, the icon browser, everything. It's about 3.6 MB of wasm.

### Getting Started

```sh
cargo add egui-shadcn
```

Then check out the examples:

```sh
cargo run --example demo
cargo run --example shadcn_demo
cargo run --example component_dashboard
```

The source is on [GitHub](https://github.com/pjankiewicz/egui-shadcn). Contributions welcome.
