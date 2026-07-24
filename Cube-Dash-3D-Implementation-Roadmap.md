**MEGAGAMEBOX**

**Cube Dash 3D**

Step-by-Step AI Agent Implementation Roadmap

  -----------------------------------------------------------------------
  **OWNER\                **VERSION\              **DATE\
  MD. Marajul Haque**     1.0.0**                 24 July 2026**
  ----------------------- ----------------------- -----------------------

  -----------------------------------------------------------------------

+-----------------------------------+-----------------------------------+
|                                   | **Design mandate**                |
|                                   |                                   |
|                                   | Premium mobile-first 3D arcade    |
|                                   | experience; offline-first; safe   |
|                                   | for embedded Flutter WebView;     |
|                                   | production-ready ZIP packaging.   |
+===================================+===================================+
+-----------------------------------+-----------------------------------+

CONFIDENTIAL PROJECT WORKING DOCUMENT

+-----------------------------------+-----------------------------------+
|                                   | **How to use this roadmap**       |
|                                   |                                   |
|                                   | Execute steps in order. Give one  |
|                                   | entire step to the coding agent.  |
|                                   | Do not blend future steps into    |
|                                   | the current one. The human        |
|                                   | performs only the marked review   |
|                                   | or real-device checks. Commit     |
|                                   | only after the acceptance gate    |
|                                   | passes.                           |
+===================================+=====1-2

==============================+
+-----------------------------------+-----------------------------------+

# Roadmap Operating Rules

-   The PRD is authoritative. If an agent proposes a conflicting
    shortcut, preserve the PRD and document the deviation request.

-   Each step is intentionally one focused agent session: substantial
    enough to produce a coherent increment, small enough to verify.

-   No CDN, npm runtime fetch, remote font, analytics endpoint, or
    external API may appear in the shipping bundle.

-   Generated assets must be stored locally, optimized, and reviewed by
    the human before release.

-   At the end of every step: run automated checks, open the game,
    complete the stated manual verification, then commit.

-   Keep a CHANGELOG.md and DECISIONS.md; agents update them when
    behavior or architecture changes.

# Phase Map

  -----------------------------------------------------------------------
  **Phase**               **Steps**               **Outcome**
  ----------------------- ----------------------- -----------------------
  0\. Foundation          1-2                     Repository, local
                                                  toolchain, test
                                                  harness, architecture
                                                  skeleton.

  1\. Playable Core       3-6                     Responsive Three.js
                                                  tunnel, controls,
                                                  movement, collision,
                                                  first complete run.

  2\. Game Depth          7-10                    Patterns, progression,
                                                  scoring, polish
                                                  effects, audio.

  3\. Product UX          11-14                   Menus, tutorial,
                                                  settings,
                                                  accessibility,
                                                  persistence, bridge.

  4\. Production          15-18                   Performance, testing,
  Hardening                                       assets, ZIP validation
                                                  and release.
  -----------------------------------------------------------------------

# Step 1. Create repository foundation and offline build contract

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       AI

  Agent task                          Set up a browser game repository
                                      that produces a self-contained
                                      production folder. Use Three.js
                                      from a local dependency and bundle
                                      it into local output. Create the
                                      PRD-aligned folders, package
                                      scripts for
                                      dev/build/test/size-report, root
                                      index.html, placeholder
                                      manifest.json, styles, source
                                      entry, test folders, README,
                                      CHANGELOG, DECISIONS, and
                                      .gitignore. Add the required mobile
                                      viewport, full-screen CSS reset,
                                      safe-area variables, touch-action
                                      prevention, and a visible
                                      boot/error shell. The production
                                      build must contain no network
                                      dependencies and must be runnable
                                      from a local HTTP server.

  Human gate                          Human: inspect the boot shell on
                                      one phone-size and one tablet-size
                                      viewport; verify typography and
                                      spacing feel premium, not like a
                                      developer demo.

  Commit                              chore: scaffold cube dash 3d
                                      offline web game
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] Production folder opens from a local server with no console
    error.

-   \[ \] Browser network log shows zero remote requests.

-   \[ \] index.html and manifest.json are at build root.

-   \[ \] README documents install, dev, test, build, and package
    commands.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 2. Implement architecture skeleton, state machine, and diagnostics

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       AI

  Agent task                          Create the authoritative game state
                                      machine and modular services
                                      described by the PRD. Add BOOT,
                                      MENU, TUTORIAL, COUNTDOWN, RUNNING,
                                      PAUSED, GAME_OVER, FATAL_ERROR
                                      states with guarded transitions.
                                      Add configuration validation, a
                                      time service, lifecycle hooks,
                                      structured non-sensitive logger,
                                      optional debug overlay, and a
                                      fatal-error boundary that presents
                                      Retry and Quit. Write unit tests
                                      for valid and invalid transitions.
                                      No real gameplay yet.

  Human gate                          Human: deliberately trigger the
                                      test error flag and verify the
                                      recovery screen is understandable.

  Commit                              feat: add game state machine and
                                      diagnostics
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] All state transitions are explicit and unit tested.

-   \[ \] Duplicate initialization and duplicate event listeners are
    prevented.

-   \[ \] visibilitychange/pagehide hooks pause safely.

-   \[ \] Fatal errors show a usable DOM fallback rather than a blank
    canvas.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 3. Build responsive Three.js scene and quality presets

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       AI

  Agent task                          Implement the Three.js renderer,
                                      camera, lighting, resize handling,
                                      and quality presets. Render a
                                      premium animated geometric tunnel
                                      test scene using procedural
                                      geometry and local
                                      shaders/materials only. Cap device
                                      pixel ratio; implement
                                      low/medium/high presets controlling
                                      particles, shadows, effects, and
                                      antialiasing. Pause the render loop
                                      when hidden. Include a test overlay
                                      showing viewport, DPR, preset, FPS
                                      band, draw calls, and object count.

  Human gate                          Human: review on a real Android
                                      phone in portrait; check heat,
                                      smoothness, edge clipping, and the
                                      premium look.

  Commit                              feat: add responsive three js
                                      tunnel renderer
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] Canvas fills viewport without stretching or scroll.

-   \[ \] Resize and orientation changes do not recreate duplicate
    render loops.

-   \[ \] Low preset remains visually coherent and readable.

-   \[ \] No mandatory expensive post-processing is used.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 4. Implement tunnel segmentation and object pooling

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       AI

  Agent task                          Implement reusable tunnel segments
                                      moving toward a near-fixed player.
                                      Add segment pooling, recycling,
                                      procedural surface variation, rest
                                      segments, lane markings, hazard
                                      anchor points, and deterministic
                                      seeded RNG. Avoid per-frame
                                      allocations in the hot path. Add a
                                      debug mode that colors
                                      pooled/recycled elements and
                                      displays active versus pooled
                                      counts.

  Human gate                          Human: watch a long debug run and
                                      look for popping, seams, repeated
                                      visual artifacts, or motion
                                      discomfort.

  Commit                              feat: add pooled tunnel world
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] A continuous tunnel runs for at least ten minutes without
    visible seam or object-count growth.

-   \[ \] Same seed produces the same segment sequence.

-   \[ \] Recycled segments reset every mutable property.

-   \[ \] Lane geometry remains stable even when decorative tunnel
    visuals rotate.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 5. Implement player cube, lane movement, jump, and touch input

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       BOTH

  Agent task                          Build the player controller with
                                      five lanes, swipe left/right,
                                      swipe-up and lower-zone tap jump.
                                      Add keyboard fallback for
                                      development. Use time-based eased
                                      lane movement, deterministic jump
                                      curve, coyote window, queued-input
                                      cap, sensitivity configuration, and
                                      strict prevention of page
                                      scrolling/zooming/text selection.
                                      Add premium cube visuals: bevel,
                                      glow, trail, squash/stretch visual
                                      rig, landing pulse. Keep the
                                      logical collider independent of
                                      visual deformation.

  Human gate                          Human: perform at least 30
                                      left/right swipes and 20 jumps on a
                                      real phone; note accidental inputs
                                      and choose default sensitivity.

  Commit                              feat: add player movement and touch
                                      controls
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] All controls work after resize and after pause/resume.

-   \[ \] UI taps never leak into gameplay gestures.

-   \[ \] Micro-swipes are ignored; fast deliberate swipes remain
    reliable.

-   \[ \] Movement outcome is consistent across 30/60/120 Hz simulation
    tests.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 6. Add collision, gaps, death flow, and first vertical slice

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       AI

  Agent task                          Implement simple authoritative
                                      colliders, high-speed sub-step or
                                      swept checks, forgiving player
                                      hitbox, floor-gap fall detection,
                                      shield-ready damage interface, and
                                      collision event pipeline. Create a
                                      hand-authored vertical slice with
                                      lane walls, low barriers, gaps,
                                      safe shard trail, collision/fall
                                      effects, GAME_OVER transition, and
                                      one-tap restart. Use pooled
                                      fragments/particles and cap camera
                                      shake.

  Human gate                          Human: play until 20 intentional
                                      collisions/falls; assess fairness,
                                      collider forgiveness, camera shake,
                                      and restart speed.

  Commit                              feat: deliver first playable
                                      collision vertical slice
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] Every obstacle can be passed with intended controls.

-   \[ \] No high-speed tunneling through walls in stress tests.

-   \[ \] Terminal event fires once per run.

-   \[ \] Restart resets world, player, score placeholders, camera,
    timers, and pools cleanly.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 7. Create obstacle library and safe pattern grammar

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       AI

  Agent task                          Implement config-driven obstacle
                                      families: lane walls, low barriers,
                                      floor gaps, moving gates, pulse
                                      walls, crusher frames, shard
                                      trails, and rest segments. Create
                                      pattern metadata for speed tier,
                                      preview distance, safe-path
                                      timeline, incompatible neighbors,
                                      and recovery window. Implement a
                                      reachability validator that
                                      simulates lane/jump possibilities
                                      and rejects invalid sequences. Add
                                      a seeded pattern gallery/debug
                                      browser.

  Human gate                          Human: play the entire pattern
                                      gallery; flag any technically
                                      possible but visually confusing or
                                      unpleasant pattern.

  Commit                              feat: add validated obstacle
                                      pattern library
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] Every production pattern passes validation.

-   \[ \] Validator intentionally rejects provided impossible fixtures.

-   \[ \] Hazards are telegraphed through silhouette, outline,
    luminance, and motion.

-   \[ \] No pattern spawns without minimum preview and recovery
    windows.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 8. Implement difficulty director and endless progression

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       AI

  Agent task                          Implement Calm, Flow, Focus,
                                      Expert, and capped endless mastery
                                      tiers. Advance levels by distance
                                      only at rest segments. Scale speed,
                                      pattern pool, spacing, and visual
                                      intensity from data tables. Add
                                      deterministic run seeds, gentle
                                      early-run assistance, and a debug
                                      panel to jump to tiers. Speed must
                                      cap; late difficulty should come
                                      primarily from curated complexity.

  Human gate                          Human: sample each tier on device
                                      and judge readability, fatigue, and
                                      fairness; approve the final speed
                                      cap.

  Commit                              feat: add endless difficulty
                                      progression
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] Transitions occur only at safe rest segments.

-   \[ \] No discontinuous speed jump causes unavoidable failure.

-   \[ \] Each tier can be reproduced by seed.

-   \[ \] A long automated run never exceeds configured speed, spacing,
    or action-frequency limits.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 9. Implement scoring, multiplier, collectibles, and missions

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       AI

  Agent task                          Create an integer-only scoring
                                      service for distance, shards, clean
                                      dodges, near misses, multiplier,
                                      and shield impact reset. Prevent
                                      duplicate scoring from pooled
                                      obstacle reuse. Add energy shards,
                                      strict near-miss cooldown/geometry,
                                      three rotating local missions
                                      selected from safe templates, and
                                      result breakdown data. Unit test
                                      all calculations and edge cases.

  Human gate                          Human: compare displayed score
                                      changes with actions during several
                                      runs; ensure feedback is motivating
                                      but not visually noisy.

  Commit                              feat: add scoring collectibles and
                                      missions
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] Scores are deterministic for the same scripted run.

-   \[ \] Near miss cannot be farmed repeatedly from one obstacle.

-   \[ \] Multiplier caps and resets exactly as configured.

-   \[ \] Game-over data includes score, distance, level, best
    candidate, and mission deltas.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 10. Add visual juice, camera language, and audio system

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       BOTH

  Agent task                          Polish motion and feedback while
                                      preserving clarity. Add speed-based
                                      but capped FOV, damped lane camera,
                                      jump tilt, reduced/capped shake,
                                      pooled particles, trail states,
                                      near-miss streak, multiplier pulse,
                                      shield break, and game-over
                                      fracture. Build AudioManager with
                                      user-gesture initialization,
                                      compressed local music/SFX,
                                      music/SFX buses, pause/resume,
                                      visibility behavior, and global
                                      window.setAudioMuted. Provide
                                      reduced-motion behavior for every
                                      effect.

  Human gate                          Human: approve motion comfort,
                                      audio loop seams, loudness balance,
                                      originality/licensing, and
                                      low-quality appearance.

  Commit                              feat: add premium effects camera
                                      and audio
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] Effects are pooled and quality-scaled.

-   \[ \] Reduced motion removes shake, large FOV change, decorative
    rotation, and excessive trails.

-   \[ \] External mute overrides internal settings instantly.

-   \[ \] Audio recovers after background/foreground and never starts
    before user interaction.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 11. Build premium menus, HUD, pause, and result experience

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       BOTH

  Agent task                          Implement semantic DOM screens for
                                      boot, main menu, HUD, pause, game
                                      over, settings entry, help entry,
                                      and fatal error. Use a consistent
                                      neon-precision design system, large
                                      touch targets, safe-area layout,
                                      fluid type, subtle transitions,
                                      visible focus, and one dominant
                                      action per screen. Replay must be
                                      one tap. HUD must preserve preview
                                      space. Add responsive layouts for
                                      small phones and tablets.

  Human gate                          Human: perform a dedicated UI
                                      review on at least two screen
                                      sizes; verify hierarchy,
                                      typography, spacing, touch targets,
                                      and premium feel.

  Commit                              feat: add production ui shell and
                                      hud
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] All screens are reachable only through valid state
    transitions.

-   \[ \] No clipped content at smallest target viewport or tablet.

-   \[ \] Replay is available with one primary tap.

-   \[ \] Menus are keyboard navigable and have accessible names/focus
    order.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 12. Create interactive onboarding and offline help

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       BOTH

  Agent task                          Build a first-run protected
                                      tutorial that teaches lane change,
                                      jump, and survival through three
                                      playable micro-sequences. Include
                                      clear gesture illustrations made
                                      from local SVG/CSS, skip after
                                      first completion, replay from Help,
                                      and no text-heavy blocking dialog.
                                      Add concise obstacle legend and
                                      control reference. Tutorial runs
                                      must not overwrite normal best
                                      score or missions.

  Human gate                          Human: ask a fresh tester to play
                                      without coaching; observe only
                                      whether controls and objectives are
                                      understood, then approve or request
                                      simplification.

  Commit                              feat: add interactive tutorial and
                                      help
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] A new user can complete tutorial without prior instruction.

-   \[ \] Tutorial cannot end in an unfair death.

-   \[ \] Skip/replay state persists correctly.

-   \[ \] Tutorial and help remain fully usable offline.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 13. Implement settings, accessibility, and resilient local storage

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       AI

  Agent task                          Implement versioned namespaced
                                      storage for best score, missions,
                                      cosmetics, tutorial state, and
                                      settings. Add migration, schema
                                      validation, corruption recovery,
                                      quota/security exception handling,
                                      reset buttons, and no sensitive
                                      data. Settings: music, SFX,
                                      quality, reduced motion, high
                                      contrast, swipe sensitivity,
                                      tap-to-jump, and left-hand UI.
                                      Changes preview immediately and
                                      persist.

  Human gate                          Human: review high-contrast colors,
                                      reduced-motion comfort, left-hand
                                      layout, and all settings labels.

  Commit                              feat: add accessible settings and
                                      persistence
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] Corrupted and missing storage never blocks launch.

-   \[ \] External mute and internal volume rules remain correct.

-   \[ \] High contrast and reduced motion affect all required systems.

-   \[ \] Reset controls require deliberate confirmation and reset only
    intended data.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 14. Integrate MegaGameBox GameBridge and manifest contract

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       AI

  Agent task                          Create a GameBridgeAdapter with
                                      browser mock and idempotent per-run
                                      transaction. On playable run start
                                      call onGameStart with level 1. On
                                      collision/fall call onGameEnd with
                                      integer score, reached level,
                                      integer elapsed seconds, and
                                      game_over. On active run abandon
                                      report quit once, then call onQuit
                                      for explicit WebView exit.
                                      Implement global setAudioMuted.
                                      Finalize manifest fields from the
                                      PRD and add integration tests that
                                      capture payloads and duplicate-call
                                      attempts.

  Human gate                          Human: run inside MegaGameBox and
                                      verify score/time/level
                                      persistence, repeated plays, global
                                      mute, and quit behavior.

  Commit                              feat: integrate megagamebox bridge
                                      and manifest
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] Bridge-absent browser mode works without errors.

-   \[ \] Each run has exactly one start and at most one terminal end
    payload.

-   \[ \] Replay begins a new independent bridge transaction.

-   \[ \] Payload types and statuses match the platform guide.

-   \[ \] manifest id, orientation, flags, and metadata are valid.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 15. Optimize performance, memory, file size, and lifecycle

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       AI

  Agent task                          Profile the full game and remove
                                      hot-path allocations, duplicate
                                      traversal, overdraw, oversized
                                      textures/audio, and unreleased
                                      resources. Implement adaptive
                                      quality benchmark, conservative DPR
                                      limits, tab/WebView lifecycle
                                      pause, render throttling outside
                                      active play, asset manifest with
                                      errors, and automated size report.
                                      Add a deterministic soak mode and
                                      object-count/memory proxies. Do not
                                      sacrifice hazard readability for
                                      effects.

  Human gate                          Human: perform real-device heat,
                                      battery, smoothness, memory/crash,
                                      background/foreground, and
                                      repeated-run checks.

  Commit                              perf: optimize webview runtime and
                                      bundle size
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] No progressive object-count growth across repeated runs.

-   \[ \] Ten-minute soak completes without crash or material
    performance decay.

-   \[ \] Low preset meets playability target on weakest available test
    device.

-   \[ \] Zipped production bundle targets under 15 MB and remains below
    50 MB.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 16. Complete automated, visual, and regression QA

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       BOTH

  Agent task                          Expand tests for state machine,
                                      scoring, storage, RNG, patterns,
                                      collision, difficulty, bridge,
                                      settings, and lifecycle. Build
                                      scripted smoke tests and a release
                                      QA page with seeded scenarios. Test
                                      small phone/tablet viewports, high
                                      contrast, reduced motion, low
                                      quality, audio mute, resize,
                                      restart loops, and fatal fallback.
                                      Create a defect log with severity
                                      and reproduction seed.

  Human gate                          Human: complete the manual device
                                      matrix and sign the UI, fairness,
                                      accessibility, and integration
                                      gates.

  Commit                              test: complete cube dash release
                                      regression suite
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] All critical-path automated tests pass from a clean checkout.

-   \[ \] Every production pattern has a validation record.

-   \[ \] No blocker/critical defect remains open.

-   \[ \] Seed and configuration are captured for every gameplay defect.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 17. Produce and approve store-quality visual assets

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       BOTH

  Agent task                          Create a cohesive 512x512 thumbnail
                                      under 500 KB and at least three
                                      16:9 screenshots. The thumbnail
                                      should show the glowing cube
                                      entering a dramatic geometric
                                      tunnel with clear cyan/violet
                                      branding and amber hazards, no tiny
                                      text, and strong small-size
                                      silhouette. Capture truthful
                                      screenshots from the final build.
                                      Optimize all files while retaining
                                      quality. Add alt/descriptive asset
                                      notes to the release folder.

  Human gate                          Human: select the final generated
                                      thumbnail variant and approve
                                      screenshots for accuracy, appeal,
                                      and brand consistency.

  Commit                              assets: finalize cube dash catalog
                                      visuals
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] Thumbnail dimensions and file size pass requirements.

-   \[ \] Screenshots show actual final gameplay and UI states.

-   \[ \] No external watermark, embedded illegible text, or misleading
    feature appears.

-   \[ \] Assets remain sharp at app-card scale and cohesive with
    in-game art.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Step 18. Package, validate, and release v1.0.0

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Primary owner                       BOTH

  Agent task                          Create the final ZIP with
                                      index.html and manifest.json at
                                      absolute root, all paths relative,
                                      no source maps/dev tools/test
                                      files/parent folder, and only
                                      required runtime assets. Run clean
                                      build, automated tests, offline
                                      smoke test, local HTTP test, size
                                      report, manifest validation, ZIP
                                      listing check, SHA256 checksum, and
                                      MegaGameBox validator. Prepare
                                      RELEASE-NOTES.md, known issues, and
                                      rollback instructions. Do not
                                      upload unless the human explicitly
                                      performs the release command with
                                      credentials.

  Human gate                          Human: inspect ZIP contents, run
                                      the real-device golden path, retain
                                      checksum, and manually execute the
                                      authenticated upload command when
                                      ready.

  Commit                              release: package cube dash 3d
                                      v1.0.0
  -----------------------------------------------------------------------

## Acceptance checklist

-   \[ \] ZIP root contains index.html and manifest.json directly.

-   \[ \] Airplane-mode launch, play, replay, mute, and quit pass in
    embedded WebView.

-   \[ \] dart run scripts/validate_game.dart \--file \<zip\> passes.

-   \[ \] Version is 1.0.0; checksum and final size are recorded.

-   \[ \] No API key, token, local path, or private test data exists in
    the archive.

## Agent handoff output

-   Summary of files created or changed.

-   Commands executed and their results.

-   Acceptance checklist with evidence.

-   Known limitations or deferred items, without implementing future
    roadmap steps.

-   Exact manual checks the human should perform now.

# Final Release Gate

  -----------------------------------------------------------------------
  **Gate**                **Approver**            **Pass condition**
  ----------------------- ----------------------- -----------------------
  Gameplay                Human                   Controls are reliable;
                                                  patterns are fair;
                                                  progression creates a
                                                  strong one-more-run
                                                  loop.

  UI/UX                   Human                   Menus/HUD are premium,
                                                  legible, unclipped, and
                                                  intuitive on
                                                  phone/tablet.

  Accessibility           Human + tests           Reduced motion,
                                                  contrast, mute, focus,
                                                  touch targets, and
                                                  settings work.

  Technical               Agent + tests           No network dependency,
                                                  leaks, duplicate bridge
                                                  events, or validation
                                                  failures.

  Performance             Human + profiler        Weakest available
                                                  device remains playable
                                                  without progressive
                                                  degradation.

  Packaging               Agent + human           Correct root ZIP,
                                                  metadata, catalog
                                                  assets, checksum, and
                                                  validator pass.
  -----------------------------------------------------------------------

# Copy-Paste Prompt Wrapper for Any Step

Use this wrapper with exactly one roadmap step at a time:

+-----------------------------------+-----------------------------------+
|                                   | **Agent prompt template**         |
|                                   |                                   |
|                                   | You are implementing one          |
|                                   | production step for Cube Dash 3D. |
|                                   | Read Cube-Dash-3D-PRD.docx and    |
|                                   | the current repository before     |
|                                   | editing. Implement only the       |
|                                   | supplied roadmap step and its     |
|                                   | prerequisites already present in  |
|                                   | the repository. Preserve          |
|                                   | offline-first MegaGameBox         |
|                                   | constraints: no remote runtime    |
|                                   | dependency, root-ready            |
|                                   | index.html/manifest.json,         |
|                                   | relative paths, touch-first UI,   |
|                                   | mobile WebView performance, and   |
|                                   | GameBridge compatibility. Add or  |
|                                   | update tests and documentation.   |
|                                   | Run the relevant checks. Do not   |
|                                   | claim success without evidence.   |
|                                   | At the end return: files changed, |
|                                   | architectural decisions,          |
|                                   | commands/results, acceptance      |
|                                   | checklist evidence, deferred      |
|                                   | issues, and the human             |
|                                   | verification script.              |
+===================================+===================================+
+-----------------------------------+-----------------------------------+

# Human Verification Record Template

  -----------------------------------------------------------------------
  **Item**                            **Record**
  ----------------------------------- -----------------------------------
  Step                                

  Device/build                        

  Checks performed                    

  Issues found                        

  Decision                            PASS / PASS WITH NOTES / FAIL

  Reviewer/date                       
  -----------------------------------------------------------------------
