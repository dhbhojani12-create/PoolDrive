package io.github.dhbhojani12.pooldrive;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.androidbrowserhelper.trusted.LauncherActivity;

import java.io.File;
import java.io.FileInputStream;

/** App icon entry: shows the last crash report (if any), otherwise opens PoolDrive. */
public class StartActivity extends Activity {
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        File f = new File(getFilesDir(), "crash.txt");
        if (!f.exists()) {
            openPoolDrive();
            return;
        }
        String report;
        try (FileInputStream in = new FileInputStream(f)) {
            byte[] buf = new byte[(int) f.length()];
            int n = in.read(buf);
            report = new String(buf, 0, Math.max(n, 0), "UTF-8");
        } catch (Exception e) {
            report = "Could not read crash report: " + e;
        }
        final String text = report;

        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(40, 80, 40, 40);
        box.setBackgroundColor(Color.WHITE);
        TextView head = new TextView(this);
        head.setText("PoolDrive crashed last time.\nTap “Copy report” and paste it to Claude so the bug can be fixed.");
        head.setTextSize(16);
        head.setTextColor(Color.BLACK);
        box.addView(head);
        Button copy = new Button(this);
        copy.setText("Copy report");
        copy.setOnClickListener(v -> {
            ClipboardManager cm = getSystemService(ClipboardManager.class);
            cm.setPrimaryClip(ClipData.newPlainText("PoolDrive crash", text));
            Toast.makeText(this, "Copied", Toast.LENGTH_SHORT).show();
        });
        box.addView(copy);
        Button open = new Button(this);
        open.setText("Clear report and open PoolDrive");
        open.setOnClickListener(v -> {
            f.delete();
            openPoolDrive();
        });
        box.addView(open);
        ScrollView sv = new ScrollView(this);
        TextView body = new TextView(this);
        body.setText(text);
        body.setTextSize(11);
        body.setTextIsSelectable(true);
        body.setTextColor(Color.DKGRAY);
        sv.addView(body);
        box.addView(sv, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1));
        setContentView(box);
    }

    void openPoolDrive() {
        Intent i = new Intent(this, LauncherActivity.class);
        i.setAction(Intent.ACTION_MAIN);
        i.addCategory(Intent.CATEGORY_LAUNCHER);
        startActivity(i);
        finish();
    }
}
