package com.fanfare.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        // Required for Google Auth to work properly with scopes
    }
}
