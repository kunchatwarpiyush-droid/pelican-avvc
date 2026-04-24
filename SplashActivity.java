package com.pelican.avvc;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

public class SplashActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                             WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().getDecorView().setBackgroundColor(Color.parseColor("#0d1b2a"));

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(android.view.Gravity.CENTER);
        root.setBackgroundColor(Color.parseColor("#0d1b2a"));

        // Logo
        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.ic_logo);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(220, 220);
        lp.gravity = android.view.Gravity.CENTER_HORIZONTAL;
        logo.setLayoutParams(lp);
        logo.setPadding(0, 0, 0, 32);
        root.addView(logo);

        // App name
        TextView title = new TextView(this);
        title.setText("Pelican AV/VC");
        title.setTextColor(Color.WHITE);
        title.setTextSize(28f);
        title.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        title.setGravity(android.view.Gravity.CENTER);
        root.addView(title);

        // Subtitle
        TextView sub = new TextView(this);
        sub.setText("Project Manager");
        sub.setTextColor(Color.parseColor("#f59e0b"));
        sub.setTextSize(14f);
        sub.setGravity(android.view.Gravity.CENTER);
        sub.setLetterSpacing(0.15f);
        sub.setPadding(0, 8, 0, 60);
        root.addView(sub);

        // Loading dot
        View dot = new View(this);
        LinearLayout.LayoutParams dlp = new LinearLayout.LayoutParams(12, 12);
        dlp.gravity = android.view.Gravity.CENTER_HORIZONTAL;
        dot.setLayoutParams(dlp);
        dot.setBackgroundColor(Color.parseColor("#f59e0b"));

        setContentView(root);

        new Handler().postDelayed(() -> {
            startActivity(new Intent(SplashActivity.this, MainActivity.class));
            finish();
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
        }, 1800);
    }
}
