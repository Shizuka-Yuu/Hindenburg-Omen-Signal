# MST: Market Stress Tracker

### (Inspired by the Hindenburg Omen — An Independent Market Internal State Monitor)

## Project Overview

The **Market Stress Tracker (MST)** is an independent macro-environmental framework developed to continuously evaluate underlying structural distortions and systemic loads within the stock market, deeply inspired by the constituent elements of the traditional "Hindenburg Omen."

### Our Mission

The traditional Hindenburg Omen operates merely as a binary, digital signal—triggering a strict "On/Off (1 or 0)" flag when rigid criteria are met. Consequently, it completely fails to capture the latent periods, the shifting gradations, and the underlying dynamics near the threshold boundaries, often leading to market "whipsaws" (false signals).

The MST deconstructs the core Market Internals and Market Breadth indicators that drive the Omen. By measuring their **processes, states, gradations, depth, and structural deviations**, the MST translates raw inputs into a **continuous evaluation of internal systemic stress.**

The ultimate objective of this project is to escape the limitations of binary crash-prediction and to **re-engineer the traditional Omen into a high-fidelity, continuous Market Internal State Monitor.**

---

## 1. Market Essence: Liquidity and Intentional Distortion

The absolute lifeline of any market is **"liquidity."** The moment liquidity dries up, the market faces functional death. However, if a market becomes perfectly efficient, uniform, and stable, volatility (price differentials) disappears. Deprived of incentives, market participants inevitably depart.

Consequently, to survive and maintain liquidity, the market bears a structural destiny: **it must continuously swing in all directions, intentionally creating states of imbalance.**

> **【System Scope & Definition】**
>
> This system is **not** a conventional signal tool designed to dictate specific trading opportunities (entries or exits). It fundamentally diverges from pure, bottom-up investment approaches that focus on individual corporate fundamentals or specific sector growth.
>
> The true role of this system is a **macro-environmental tracker that objectively measures structural stress** (the accumulation of distortion and systemic load) within the market aggregate. By employing a top-down approach, it aims to track global deviations driven by the market's survival strategies, uncovering critical blind spots hidden within the collective price action.

## 2. Limitations of the Traditional "Hindenburg Omen"

The traditional Hindenburg Omen (HO) operates on a binary, digital logic: it triggers a "1" (active) when specific conditions are met and a "0" (inactive) when they are not.

However, in reality, the threshold region is merely the threshold or latent period leading into a sell signal. This rigid binary approach (1 or 0) frequently generates market "whipsaws" (false signals), which is precisely why the indicator is often dismissed as pseudo-scientific or occult by traditional analysts.

## 3. Core Design Philosophy: The Zero-Point and Deviation Volume

Within this dashboard, we do not define the state where parameters sit near the baseline (Zero-Point) as "safe" or "healthy." Given that this system uses the Hindenburg Omen as its foundational hook, the baseline itself represents the literal entryway to danger. Furthermore, when parameters swing into the green zone, it is never interpreted as a recovery to a healthy market state.

When analyzing **Market Breadth**, what truly matters is not a binary flag of whether a signal is on or off. The core philosophy of this dashboard lies in tracking **"Deviation Volume" (Depth of Distortion)—measuring exactly how deeply and in which direction parameters are pulling away from the Zero-Point.**

### The True Meaning of Colors (Red & Green)

The visual representation of "Red" and "Green" does not reflect a standard "Negative vs. Positive" or "Danger vs. Safe" binary.

- **Red (Omenside Deviation):** Indicates that traditional HO conditions are being met, with the length of the bar visualizing the depth and divergence of the systemic distortion in that specific direction.
- **Green (Reverse-side Deviation):** Indicates that while traditional HO conditions are absent, the market is exhibiting an abnormal structural bias in the opposite vector.

Regardless of which direction the bars expand, it simply signifies that **the nature of the market's distortion has shifted.** Both states equally expose an abnormal systemic imbalance.

## 4. Parameter & State Definitions

### NEW HIGHS

- **Calculation:** The percentage of issues achieving 52-week new highs relative to the total number of listed issues in the respective market (NYSE / NASDAQ).
- **Baseline:** 2.2% (The historical threshold for traditional HO activation)
- **Red Deviation (High-side Imbalance State):** Expands above 2.2%. Visualizes the depth of expanding new highs amid surface-level market advances—representing one half of the Omen's activation criteria.
- **Green Deviation (High-side Momentum Atrophy State):** Contracts below 2.2% toward 0%. Represents the structural loss of upward driving energy (the systemic capacity to bid up new highs).

### NEW LOWS

- **Calculation:** The percentage of issues achieving 52-week new lows relative to the total number of listed issues in the respective market (NYSE / NASDAQ).
- **Baseline:** 2.2% (The historical threshold for traditional HO activation)
- **Red Deviation (Low-side Imbalance State):** Expands above 2.2%. Visualizes the depth of internal fragmentation and underlying decay occurring beneath a rising or consolidating market surface.
- **Green Deviation (Low-side Momentum Atrophy State):** Contracts below 2.2% toward 0%. Does not indicate safety, but rather a state of total stagnation where even the downward liquidity required to print new lows has completely vanished.

### M'LLELAN OSC (McClellan Oscillator)

- **Calculation:** The 19-day Exponential Moving Average (EMA) subtracted by the 39-day EMA of the market's Net Advancing Issues (Advancing Issues minus Declining Issues).
- **Baseline:** 0 (The equilibrium point between short- and medium-term breadth trends)
- **Red Deviation (Liquidity Outflow State):** Drops below 0 with expanding negative value. Represents a rapid retreat of short-term buying demand and a deep, downward liquidity bias (selling pressure).
- **Green Deviation (Short-term Overheating State):** Rises above 0 with expanding positive value. Reflects the depth of upward distortion, which may stem from short-term reflexive rebounds within a bear market or hyper-localized capital concentration.

### H/L RATIO

- **Calculation:** The ratio of New Highs divided by New Lows ($\text{Ratio} = \frac{\text{New Highs}}{\text{New Lows}}$).
- **Baseline:** 2.0
- **Red Deviation (New Low Dominance State):** Drops below 2.0. Denotes that the denominator (New Lows) is becoming dominant, visualizing the acceleration of a downward internal market vector.
- **Green Deviation (New High Dominance State):** Rises above 2.0. Denotes that the numerator (New Highs) is becoming dominant, visualizing one-sided market crowding or localized overheating.

### TREND

- **Calculation:** The percentage deviation of the index's current price relative to its 50-day Simple Moving Average (50-day SMA).
- **Baseline:** 0% (The structural midpoint of the medium-term trend)
- **Red Deviation (Upward Divergence State):** Expanding positive values. Measures the depth of upward divergence where the current price structure is abnormally stretched away from the 50-day SMA.
- **Green Deviation (Downward Anchored State):** Expanding negative values. Measures the depth of downward trend entrenchment, where the market structure remains structurally locked into a lower vector.

## 5. Momentum & Accumulation Metrics

### DEV INDEX (Deviation Index)

- **Calculation:** A proprietary macro-composite index generated by applying distinct scaling factors to the "Daily Deviation" ($\text{Current Value} - \text{Baseline}$) of the five core metrics, followed by a weighted average calculation.
  > **【Scaling Factor Optimization】**
  >
  > To normalize the differing numerical scales (percentages, absolute numbers, and ratios) into a uniform analytical granularity, the following scaling coefficients are applied:
  >
  > - NEW HIGHS: `100`
  > - NEW LOWS: `100`
  > - M'LLELAN OSC: `0.1` (Scaled down due to its large absolute integer properties)
  > - H/L RATIO: `1` (Applied raw as a pure ratio structure)
  > - TREND: `100`
- **State Definitions:**
  - **Red Deviation (Extreme Upward Overextension State):** Represents severe, aggregate upward structural displacement, signaling a high mathematical probability of a sharp mean-reversion (correction/drop).
  - **Green Deviation (Extreme Downward Overextension State):** Represents severe, aggregate downward displacement, indicating that the market has sunk into historical valuation extremes.

### 5D AVG (5-Day Moving Average)

- **Calculation:** The 5-day Simple Moving Average (SMA) of the DEV INDEX.
- **Design Intent:** Smooths out day-to-day noise to trace the underlying velocity and direction of structural distortion—effectively visualizing how systemic stress is being _accumulated_ over a rolling period.

### TOTAL / 5D HIST (5-Day Cumulative Allocation & History)

- **Calculation:**
  - **TOTAL:** The absolute sum of the DEV INDEX over the past 5 trading sessions.
  - **5D HIST:** A rolling 5-day historical sequence of the daily DEV INDEX displayed via a zero-bound Win-Lose vertical bar chart.
- **Design Intent:** Simultaneously captures the aggregate volume of systemic stress built up in the market's interior (TOTAL) alongside the daily directional trajectory and decay rate of that energy (5D HIST).

## 6. Cluster Tracker (Bottom Dot Matrix)

### System Logic & Rolling Window

The matrix tracks the **density (clustering)** of traditional Hindenburg Omen "Full Triggers" (100% signal completion) over a rolling 30-day timeline. Rather than focusing on single-day occurrences, its design intent is to capture the frequency and persistence of severe market distortion.

- **Trigger Condition (🔴 Plot):** The trigger event occurs precisely when the "NYSE(SIGNAL)" or "NASDAQ(SIGNAL)" at the top of the dashboard reaches **100.00%** (fully satisfying all constituent HO criteria). Upon this event, a red dot (🔴) is plotted. Non-trigger days (under 100%) are recorded as green dots (🟢).
- **Queue Dynamics:** The **far-right dot represents the current (latest) trading day**, moving chronologically older as it traces to the left. The tracker maintains a hard ceiling of **30 trading days**. Once the 30-day window is filled, the introduction of a new trading day on the far right automatically discards the oldest data point on the far left, shifting the entire timeline leftward in a continuous rolling-window execution.

---

## License

This project's code, philosophy, and architectural definitions are licensed under CC BY-NC-SA 4.0.

- **Personal & Non-Commercial Use:** You are free to share, fork, and adapt this material for non-commercial purposes, provided credit is given.

- **Commercial Use:** If you intend to integrate this logic into paid services, commercial media, or utilize the MST definitions and logic for commercial activities, please contact the author or open an issue in advance to request permission and discuss licensing.
