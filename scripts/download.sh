#!/bin/bash 
BASE="$GITHUB_WORKSPACE"
# Function to download a file if it has been updated
download_file() {
    local url="$1"
    local etag_file="$BASE/data/$2"
    local download_file="$BASE/data/$3"
    local headers_file="headers.txt"

    # Check if the ETag file exists and read the ETag
    etag="000"
    if [ -f "$etag_file" ]; then
        etag=$(cat $etag_file)
    fi

    # Use 'curl' to download the file and headers. 
    curl -s -D $headers_file -H "If-None-Match: $etag" $url -o $download_file

    # Check HTTP status code from the headers file
    local http_status=$(grep "^HTTP/[0-9]" "$headers_file" | awk '{print $2}')

    # Check if the file was modified and downloaded (HTTP 200)
    if [ "$http_status" = "200" ]; then
        # Extract and store the new ETag from the headers file
        local new_etag=$(grep -i ETag "$headers_file" | awk '{print $2}'| sed 's/\r//')
        echo $new_etag > "$etag_file"
    fi

    # Clean up: Remove the headers file
    rm -f $headers_file
}

split_element() {
    echo "$1" | tr '|' ' ' | while read -r part; do
    	echo "$part"
    done
}

download_items=$DOWNLOAD_ITEMS


for element in $download_items; do
    translated_sep=$(echo "$element" | sed 's/%7C/|/g'| sed 's/"//g')
    # Capture the output of split_element into a variable
    parts=$(split_element $translated_sep)

    download_file $parts
done

