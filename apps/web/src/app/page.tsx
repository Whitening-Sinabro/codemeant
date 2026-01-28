"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-production-82c0.up.railway.app";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/v1/waitlist/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing" }),
      });

      if (!res.ok) {
        throw new Error("Failed to join waitlist");
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">Now in Beta · Shipping daily</div>
        <h1>3-month onboarding,<br />done in 3 weeks.</h1>
        <p className="subtitle">
          Stop answering the same questions over and over.
          <br />
          Let AI onboard your juniors and give seniors their time back.
        </p>

        {!submitted ? (
          <>
            <form className="waitlist-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Joining..." : "Join the Beta"}
              </button>
            </form>
            {error && <p style={{ color: "var(--warning)", marginTop: "0.5rem" }}>{error}</p>}
          </>
        ) : (
          <div className="submitted-message">
            <span className="check-icon">✓</span>
            <p>You&apos;re in! We&apos;ll reach out when beta opens.</p>
          </div>
        )}

        <p className="beta-note">
          First 100 spots · <strong>2 months free</strong> for early feedback
        </p>
      </section>

      {/* Problem */}
      <section className="section problem-section">
        <h2 className="section-title">Every team deals with this</h2>
        <div className="problems">
          <div className="problem-card">
            <div className="problem-number">3 mo</div>
            <h3>New hire onboarding</h3>
            <p>Months just to understand the codebase</p>
          </div>
          <div className="problem-card">
            <div className="problem-number">30%</div>
            <h3>Senior time burned</h3>
            <p>Answering the same questions on repeat</p>
          </div>
          <div className="problem-card">
            <div className="problem-number">Every PR</div>
            <h3>Manual pre-merge checks</h3>
            <p>Tests, builds, lint... forget one, CI fails</p>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="section solution-section">
        <h2 className="section-title">Three tools. Problem solved.</h2>
        <div className="solutions">
          <div className="solution-card">
            <div className="solution-header">
              <span className="solution-label">01</span>
              <h3>Ship</h3>
            </div>
            <p className="solution-tagline">Code done → PR ready. One click.</p>
            <ul className="solution-features">
              <li>Auto-run tests</li>
              <li>Verify build</li>
              <li>AI self-review</li>
              <li>Generate PR</li>
            </ul>
          </div>

          <div className="solution-card featured">
            <div className="solution-header">
              <span className="solution-label">02</span>
              <h3>Onboard</h3>
            </div>
            <p className="solution-tagline">Understand any codebase. Instantly.</p>
            <ul className="solution-features">
              <li>Auto-analyze repo structure</li>
              <li>Visualize architecture</li>
              <li>Highlight key files</li>
              <li>First PR in 3 weeks</li>
            </ul>
          </div>

          <div className="solution-card">
            <div className="solution-header">
              <span className="solution-label">03</span>
              <h3>Mentor</h3>
            </div>
            <p className="solution-tagline">A senior dev that never sleeps.</p>
            <ul className="solution-features">
              <li>Instant code answers</li>
              <li>Learns team conventions</li>
              <li>PR review assist</li>
              <li>50% less senior load</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How Beta Works */}
      <section className="section">
        <h2 className="section-title">How to join the beta</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Sign up</h3>
            <p>First 100 get in</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Quick survey</h3>
            <p>2 min, helps us build better</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Use the MVP</h3>
            <p>Real projects, real feedback</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Share feedback</h3>
            <p>→ 2 months free at launch</p>
          </div>
        </div>
      </section>

      {/* Survey CTA */}
      <section className="section survey-section">
        <div className="survey-card">
          <h2>Got 2 minutes?</h2>
          <p>Tell us about your pain points. It helps us build what you actually need.</p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfwlCPu81NTbqboGIa-XCj05MvxBxvUQW91EixMnuaKEKrRLw/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Take the survey (2 min)
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta">
        <h2>Scaling your team shouldn&apos;t slow you down</h2>
        <p>First 100 spots · 2 months free for early feedback</p>

        {!submitted ? (
          <>
            <form className="waitlist-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Joining..." : "Join the Beta"}
              </button>
            </form>
            {error && <p style={{ color: "var(--warning)", marginTop: "0.5rem" }}>{error}</p>}
          </>
        ) : (
          <div className="submitted-message">
            <span className="check-icon">✓</span>
            <p>You&apos;re already on the list!</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 CodeMeant. All rights reserved.</p>
        <p className="footer-links">
          <a href="mailto:hello@codemeant.dev">Contact</a>
        </p>
      </footer>
    </>
  );
}
