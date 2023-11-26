#!/bin/bash
BASE="$GITHUB_WORKSPACE"
# Function to download a file if it has been updated
download_file() {
    local url="$1"
    local etag_file="$BASE/data/$2"
    local download_file="$BASE/data/$3"
    local headers_file="headers.txt"

    # Check if the ETag file exists and read the ETag
    local etag=""
    if [ -f "$etag_file" ]; then
        etag=$(cat "$etag_file")
    fi

    # Use 'curl' to download the file and headers. '-D' dumps headers to a file.
    curl -s -D "$headers_file" -H "If-None-Match: $etag" "$url" -o "$download_file"

    # Check HTTP status code from the headers file
    local http_status=$(grep "^HTTP/[0-9]" "$headers_file" | awk '{print $2}')

    # Check if the file was modified and downloaded (HTTP 200)
    if [ "$http_status" = "200" ]; then
        # Extract and store the new ETag from the headers file
        local new_etag=$(grep -i ETag "$headers_file" | awk '{print $2}')
        echo "$new_etag" > "$etag_file"
    fi

    # Clean up: Remove the headers file
    rm "$headers_file"
}

#"https://github.com/BryanMorgan/isbot/blob/main/src/bot_regex_patterns.txt"

download_file "https://raw.githubusercontent.com/BryanMorgan/isbot/main/src/bot_regex_patterns.txt" "bot_regex_patterns.etag" bot_regex_patterns.txt

download_file "https://iplists.firehol.org/files/firehol_level1.netset" firehol_level1.etag ipv4.blacklist

