package io.github.dhbhojani12.pooldrive;

import android.app.Application;

import java.io.FileOutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;

/** Saves the details of any crash so the next launch can show them (for fixing bugs). */
public class App extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        final Thread.UncaughtExceptionHandler prev = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> {
            try {
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                String ver = "?";
                try { ver = getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Throwable ignored) { }
                String info = "PoolDrive " + ver + " · Android " + android.os.Build.VERSION.RELEASE
                        + " · " + android.os.Build.MODEL + "\nThread: " + t.getName() + "\n\n" + sw;
                try (FileOutputStream o = openFileOutput("crash.txt", MODE_PRIVATE)) {
                    o.write(info.getBytes("UTF-8"));
                }
            } catch (Throwable ignored) {
            }
            if (prev != null) prev.uncaughtException(t, e);
        });
    }
}
